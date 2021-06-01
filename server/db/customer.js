const conn = require("./index.js").db;
const { getFutureDate, randomBase64 } = require("../utils");

/* -------------------------------- CUSTOMERS ------------------------------- */
exports.addCustomer = async ({ firstName, lastName = null, street = null, city = null, state = null, zipCode = null, phoneNumber = null, referrerId = null }) => {
    const sql = `INSERT INTO customer (firstName, lastName, street, city, state, zipCode, phoneNumber)
                    VALUES (?, ?, ?, ?, ?, ?, ?);`;
    const [{ insertId: customerId },] = await conn.query(sql, [firstName, lastName, street, city, state, zipCode, phoneNumber]);

    if (referrerId !== undefined && referrerId !== null) await this.addReferral(referrerId, customerId);

    return customerId;
};

exports.addReferral = async (referrerId, referredId) => {
    const sql = `INSERT INTO referral (referrerId, referredId) VALUES (?, ?);`;
    await conn.query(sql, [referrerId, referredId]);
    return true;
};

exports.consumeInvitation = async (invitationId) => {
    const sql = `UPDATE     invitation AS i
                SET         i.isConsumed = 1
                WHERE       i.invitationId = ?;`;
    await conn.query(sql, [invitationId]);

    return true;
};

exports.createInvitation = async (customerId) => {
    const token = randomBase64(20).replace("/", "_");
    const expiryDate = getFutureDate({ hours: 24 });

    const sql = `INSERT INTO invitation (customerId, inviteToken, expiryDate) VALUES (?, ?, ?);`;
    await conn.query(sql, [customerId, token, expiryDate]);

    return token;
};

exports.deleteCustomer = async (customerId) => {
    const sql = `DELETE
                FROM        customer
                WHERE       customerId = ?;`;
    await conn.query(sql, [customerId]);
    return true;
};

exports.getAllCustomers = async () => {
    const sql = `SELECT     *
                FROM        customer AS c
                ORDER BY    c.customerId DESC`;
    const [customers,] = await conn.query(sql);

    if (customers.length > 0) {
        const referrals = await this.getAllReferrals();

        referrals.length > 0 && customers.forEach(c => c.referrerId = referrals.find(r => r.referredId === c.customerId)?.referrerId ?? null);
    }

    return customers;
};

exports.getCustomer = async (customerId) => {
    const sql = `SELECT     *
                FROM        customer AS c
                WHERE       c.customerId = ?;`;
    const [customers,] = await conn.query(sql, [customerId]);

    return customers.length > 0 ? customers[0] : false;
};

exports.getCustomerId = async (userId) => {
    const sql = `SELECT     c.customerId
                FROM        customer AS c
                WHERE       c.userId = ?;`;
    const [customers,] = await conn.query(sql, [userId]);

    return customers[0]?.customerId ?? false;
};

exports.getAllReferrals = async () => {
    const sql = `SELECT   *
        FROM    referral AS r;`
    const [referrals,] = await conn.query(sql);
    return referrals;
};

exports.getReferrals = async ({ referrerId, referredId }) => {
    const sql = `SELECT   *
                FROM    referral AS r
                WHERE   r.referre${referrerId ? "r" : "d"}Id = ?`;
    const [referrals,] = await conn.query(sql, [referrerId ?? referredId]);
    return referrals;
};

exports.getInvitation = async (token) => {
    const sql = `SELECT     *
                FROM        invitation AS i
                WHERE       i.token = ?;`;
    const [invitations,] = await conn.query(sql, [token]);

    return invitations[0] ?? false;
};

exports.updateCustomer = async (customerId, property, value) => {
    if (property === "referrerId") return await this.updateReferral(customerId, value);

    const sql = `UPDATE     customer AS c
                SET         c.${property} = ?
                WHERE       c.customerId = ?;`;
    await conn.query(sql, [value, customerId]);

    return true;
};

exports.updateReferral = async (referredId, referrerId) => {
    if (!referrerId) {
        const sql = `DELETE
                    FROM    referral
                    WHERE   referredId = ?;`
        await conn.query(sql, [referredId]);

        return true;
    }

    const referrals = await this.getReferrals({ referredId });
    if (referrals.length === 0) await this.addReferral(referrerId, referredId);

    const sql = `UPDATE     referral AS r
                SET         r.referrerId = ?
                WHERE       r.referredId = ?;`;
    await conn.query(sql, [referrerId, referredId]);

    return true;
};
