const { app } = require("../index.js");
const db = require("../db");
const { handleErrors, emptyStringsToNull, validateForm } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");

const reqs = {
    price: { name: "Price", type: "decimal", isRequired: true },
    quantity: { name: "Quantity", type: "decimal", isRequired: true },
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/cart", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const cart = await db.getCart(req.user.userId);

        return res.send({ success: true, cart, refreshedAccessToken });
    }));

    /* ----------------------------------- POST ---------------------------------- */
    app.post("/api/cart", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const cartItem = emptyStringsToNull(req.body);
        for (const key in cartItem) if (!validateForm(reqs, key, cartItem[key], res, refreshedAccessToken)) return;

        const cartItemId = await db.addCartItem(req.user.userId, cartItem);

        return res.send({ success: true, cartItemId, refreshedAccessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/cart/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const cartItem = emptyStringsToNull(req.body);
        for (const key in cartItem) if (!validateForm(reqs, key, cartItem[key], res, refreshedAccessToken)) return;

        await db.updateCartItem(req.params.id, cartItem);

        return res.send({ success: true, refreshedAccessToken });
    }));

    /* ----------------------------------- DELETE ---------------------------------- */
    app.delete("/api/cart", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        await db.emptyCart(req.user.userId);

        return res.send({ success: true, refreshedAccessToken });
    }));

    app.delete("/api/cart/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        await db.deleteCartItems([req.params.id]);

        return res.send({ success: true, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }