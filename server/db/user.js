const conn = require("./index.js").db;
const { updateCustomer } = require("./customer.js");
const { checkIsExpired } = require("../utils/index.js");

exports.getLoginInfo = async ({ username, userId }) => {
    const sql = `SELECT      u.userId, u.username, u.passwordHash, u.accessLevel
                FROM        user AS u
                WHERE       u.${userId ? "userId" : "username"} = ?;`;
    const [rows,] = await conn.query(sql, [userId ?? username]);

    return rows[0] ?? false;
};

exports.register = async (customerId, username, passwordHash) => {
    const sql = `SELECT     c.userId
                FROM        customer AS c
                WHERE       c.customerId = ?;`;
    const [customers,] = await conn.query(sql, [customerId]);
    if (customers[0].userId !== null) throw new Error("Customer already has an account");

    try {
        await conn.query("START TRANSACTION");

        const sql = `INSERT INTO user (username, passwordHash) VALUES (?, ?);`;
        const [{ insertId: userId },] = await conn.query(sql, [username, passwordHash]);

        await updateCustomer(customerId, "userId", userId);

        await conn.query("COMMIT");
        return userId;
    } catch (e) {
        await conn.query("ROLLBACK");
        throw new Error(e.message);
    }
};

exports.updateUsername = async (userId, username) => {
    const sql = `UPDATE     user AS u
                SET         u.username = ?
                WHERE       u.userId = ?;`;
    await conn.query(sql, [username, userId]);

    return true;
};

exports.updatePassword = async (userId, passwordHash) => {
    const sql = `UPDATE     user AS u
                SET         u.passwordHash = ?
                WHERE       u.userId = ?;`;
    await conn.query(sql, [passwordHash, userId]);

    return true;
};

exports.verifyInvitation = async (token) => {
    const sql = `SELECT     i.customerId, i.expiryDate, i.isConsumed
                FROM        invitation AS i
                WHERE       inviteToken = ?;`;
    const [invitations,] = await conn.query(sql, [token]);

    if (invitations.length === 0) return false;

    const { expiryDate, isConsumed, customerId } = invitations[0];
    if (isConsumed || checkIsExpired(expiryDate)) return false;

    return customerId;
};