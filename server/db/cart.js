const conn = require("./index.js").db;

exports.addCartItem = async (userId, { flavorId = null, listingId, productId, price, quantity }) => {
    const sql = `INSERT INTO cartItem (userId, listingId, productId, flavorId, price, quantity)
                    VALUES (?, ?, ?, ?, ?, ?);`;
    const [{ insertId: cartItemId },] = await conn.query(sql, [userId, listingId, productId, flavorId, price, quantity]);

    return cartItemId;
};

exports.deleteCartItems = async (cartItemIds = []) => {
    if (cartItemIds.length === 0) return false;

    const sql = `DELETE
                FROM        cartItem
                WHERE       cartItemId IN (?${", ?".repeat(cartItemIds.length - 1)});`;
    await conn.query(sql, cartItemIds);
    return true;
};

exports.emptyCart = async ({ customerId, userId }) => {
    if (!customerId && !userId) return false;

    const sql = userId ? `DELETE FROM cartItem WHERE userId = ?;`
        : `DELETE	cartItem
           FROM		cartItem INNER JOIN customer
                        ON cartItem.userId = customer.userId
           WHERE	customer.customerId = ?;`;
    await conn.query(sql, [userId ?? customerId]);
    return true;
};

exports.getCart = async (userId) => {
    const sql = `SELECT     *
                FROM        cartItem AS cI
                WHERE       cI.userId = ?;`;
    const [cart,] = await conn.query(sql, [userId]);
    return cart;
};

exports.updateCartItem = async (cartItemId, { flavorId = null, price, quantity }) => {
    const sql = `UPDATE     cartItem AS cI
                SET         cI.flavorId = ?, cI.price = ?, cI.quantity = ?
                WHERE       cI.cartItemId = ?;`;
    await conn.query(sql, [flavorId, price, quantity, cartItemId]);
    return true;
};

exports.updateCartItems = async (cartItems = []) => {
    if (cartItems.length === 0) return false;

    const props = [].concat(cartItems.map(c => [c.line.cartItemId, c.newValues.flavorId]),
                            cartItems.map(c => [c.line.cartItemId, c.newValues.quantity]),
                            cartItems.map(c => [c.line.cartItemId, c.newValues.price]),
                            cartItems.map(c => c.line.cartItemId)).flat();
    const sql = `UPDATE     cartItem AS cI
                 SET        cI.flavorId = (CASE ${"WHEN cI.cartItemId = ? THEN ? ".repeat(cartItems.length)}END),
                            cI.quantity = (CASE ${"WHEN cI.cartItemId = ? THEN ? ".repeat(cartItems.length)}END),
                            cI.price    = (CASE ${"WHEN cI.cartItemId = ? THEN ? ".repeat(cartItems.length)}END)
                 WHERE      cI.cartItemId IN (?${", ?".repeat(cartItems.length - 1)});`;
    await conn.query(sql, props);
};