const conn = require("./index.js").db;
const jwt = require("jsonwebtoken");
const { checkIsExpired, getFutureDate } = require("../utils");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

exports.deleteRefreshToken = (refreshToken) => {
    const sql = `DELETE
                FROM        token
                WHERE       token = ?;`;
    conn.query(sql, [refreshToken]);
    return true;
};

exports.generateRefreshToken = async (user, expiryOptions) => {
    const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET);
    const expiryDate = getFutureDate(expiryOptions);

    const sql = `INSERT INTO token (token, expiryDate, userId) VALUES (?, ?, ?);`;
    await conn.query(sql, [refreshToken, expiryDate, user.userId]);

    return refreshToken;
};

exports.refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) return false;

    const sql = `SELECT     t.expiryDate, t.userId
                FROM        token AS t
                WHERE       t.token = ?;`;
    const [rows,] = await conn.query(sql, [refreshToken]);

    if (rows.length === 0) return false;
    if (checkIsExpired(rows[0].expiryDate)) {
        this.deleteRefreshToken(refreshToken);
        return false;
    }

    const user = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    delete user.iat;

    const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    return accessToken;
};