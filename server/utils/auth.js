const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { ACCESS_TOKEN_SECRET } = process.env;

exports.authenticatePassword = async ({ res, userId, password, refreshedAccessToken }) => {
    const errors = [];

    try {
        const { passwordHash } = await db.getLoginInfo({ userId });
        if (!passwordHash) errors.push("Incorrect password");

        const match = await bcrypt.compare(password, passwordHash);
        if (!match) errors.push("Incorrect password");
    } catch (e) { errors.push(e); }

    if (errors.length) res.send({ success: false, message: errors.join("\n"), refreshedAccessToken });

    return errors.length ? false : true;
};

exports.authenticateUser = async (req, requiresAdmin = false) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        const authHeader = req.headers["authorization"];
        const accessToken = authHeader && authHeader.split(" ")[1];

        if ((!accessToken || accessToken === "null") && !refreshToken) throw new Error("No token");

        return await this.setSessionUser({ accessToken, refreshToken, req, requiresAdmin });
    } catch (e) {
        throw new Error(`Unauthorized access: ${e.message}`);
    }
};

exports.generateAccessToken = (user, expiresIn) => jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn });

const getNewAccessToken = async (refreshToken) => {
    if (!refreshToken) throw new Error("No refresh token");

    const accessToken = await db.refreshAccessToken(refreshToken);
    if (!accessToken) throw new Error("Failed to refresh token");

    return accessToken;
};

exports.setSessionUser = async ({ accessToken, refreshToken, req, requiresAdmin }) => {
    let user = null;

    try {
        user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name !== "TokenExpiredError") throw new Error(err);

        accessToken = await getNewAccessToken(refreshToken);
        if (!accessToken) throw new Error("Failed to refresh token");

        user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    }

    if (requiresAdmin && !user?.accessLevel) throw new Error("Access level");

    req.user = user;
    return accessToken;
};