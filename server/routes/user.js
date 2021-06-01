const bcrypt = require("bcrypt");
const { app } = require("../index.js");
const db = require("../db");
const { handleErrors, getFutureDate, validateForm, validatePassword } = require("../utils");
const { authenticateUser, authenticatePassword, generateAccessToken } = require("../utils/auth.js");

const reqs = {
    username: { name: "Username", isRequired: true, minLen: 5, maxLen: 255 },
    password: { name: "Password", isRequired: true, minLen: 8, maxLen: 72 },
    currentPassword: { name: "Current Password", isRequired: true, minLen: 8, maxLen: 72 },
    newPassword: { name: "New Password", isRequired: true, minLen: 8, maxLen: 72 },
    passwordConf: { name: "Password Confirmation", isRequired: true, minLen: 8, maxLen: 72 },
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/user/info", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const { userId, accessLevel } = req.user;

        const { username } = await db.getLoginInfo({ userId });

        return res.send({ success: true, info: { username, accessLevel }, refreshedAccessToken });
    }));

    /* ---------------------------------- POST ---------------------------------- */
    app.post("/api/user/register", handleErrors(async (req, res) => {
        const { username, password, passwordConf, token } = req.body;

        const customerId = await db.verifyInvitation(token);
        if (!customerId) return res.send({ success: false, message: "Invalid invitation" });

        if (password !== passwordConf) return res.send({ success: false, message: "Password confirmation does not match" });
        if (!validatePassword({ password, res })) return;
        for (const key in req.body) if (!validateForm(reqs, key, req.body[key], res)) return;

        if (await db.getLoginInfo({ username })) return res.send({ success: false, message: "Username already taken" });

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = await db.register(customerId, username, passwordHash);
        const accessToken = generateAccessToken({ userId, accessLevel: 0 }, "15m");

        return res.send({ success: true, accessToken });
    }));

    app.post("/api/user/login", handleErrors(async (req, res) => {
        const authHeader = req.headers["authorization"];
        if (authHeader && await authenticateUser(req))
            return res.send({ success: true, message: "User already logged in" });

        const { username, password, hasRememberMe } = req.body;
        if (!username || !password) return res.send({ success: false, message: "All fields are required" });

        const { userId, passwordHash, accessLevel } = await db.getLoginInfo({ username });
        if (!userId || !passwordHash) return res.send({ success: false, message: "Incorrect credentials" });

        const match = await bcrypt.compare(password, passwordHash);
        if (!match) return res.send({ success: false, message: "Incorrect credentials" });

        const user = { userId, accessLevel };

        const accessToken = generateAccessToken(user, "15m");

        if ([true, "true", "on", "yes"].includes(hasRememberMe)) {
            const refreshToken = await db.generateRefreshToken(user, { days: 14 });
            res.cookie("refreshToken", refreshToken, { maxAge: getFutureDate({ days: 14 }).getTime() - Date.now(), httpOnly: true });
        }

        return res.send({ success: true, accessToken });
    }));

    app.post("/api/user/token", handleErrors(async (req, res) => {
        const { refreshToken } = req.cookies;

        const accessToken = await db.refreshAccessToken(refreshToken);
        if (!accessToken) return res.send({ success: false, message: "Unauthorized access: Invalid refresh token" });

        return res.send({ success: true, accessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/user/username", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const { userId } = req.user;
        const { password, username } = req.body;

        for (const key in req.body) if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

        const isPasswordValid = await authenticatePassword({ password, userId, res, refreshedAccessToken });
        if (!isPasswordValid) return;

        if (await db.getLoginInfo({ username })) return res.send({ success: false, message: "Username already taken" });

        await db.updateUsername(userId, username);

        return res.send({ success: true, username, refreshedAccessToken });
    }));

    app.put("/api/user/password", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const { userId } = req.user;
        const { currentPassword, newPassword, passwordConf } = req.body;

        if (newPassword !== passwordConf) return res.send({ success: false, message: "Password confirmation does not match" });
        for (const key in req.body) if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

        if (!authenticatePassword({ password: currentPassword, userId, res, refreshedAccessToken })) return;

        if (!validatePassword({ password: newPassword, res, refreshedAccessToken })) return;

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await db.updatePassword(userId, newPasswordHash);

        return res.send({ success: true, refreshedAccessToken });
    }));

    /* --------------------------------- DELETE --------------------------------- */
    app.delete("/api/user/logout", handleErrors(async (req, res) => {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            db.deleteRefreshToken(refreshToken);
            res.clearCookie("refreshToken");
        }

        return res.send({ success: true, message: "Logout successful" });
    }));
} catch (e) { console.error(e); }