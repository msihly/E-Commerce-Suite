const conn = require("./index.js").db;
const { getCustomerId } = require("./customer.js");
const { getIsoDate } = require("../utils");

exports.addOrder = async ({ customerId, employeeId = null, orderDate, lineItems }) => {
    try {
        await conn.query("START TRANSACTION");

        let sql = `INSERT INTO orders (customerId, employeeId, orderDate)
                        VALUES (?, ?, ?);`;
        const [{ insertId: orderId },] = await conn.query(sql, [customerId, employeeId, orderDate]);

        sql = `INSERT INTO orderItem (orderId, lineItemNumber, listingId, productId, flavorId, quantity, pricePaid)
                    VALUES (?, ?, ?, ?, ?, ?, ?)${", (?, ?, ?, ?, ?, ?, ?)".repeat(lineItems.length - 1)};`;
        await conn.query(sql, lineItems.flatMap(({ lineItemNumber, listingId, productId, flavorId, quantity, pricePaid }) => [orderId, lineItemNumber, listingId, productId, flavorId, quantity, pricePaid]));

        await conn.query("COMMIT");
        return orderId;
    } catch (e) {
        await conn.query("ROLLBACK");
        throw new Error(e.message);
    }
};

exports.addOrderItem = async ({ flavorId = null, lineItemNumber, listingId, orderId, productId, pricePaid, quantity }) => {
    const sql = `INSERT INTO orderItem (flavorId, lineItemNumber, listingId, orderId, productId, pricePaid, quantity)
                    VALUES (?, ?, ?, ?, ?, ?, ?);`;
    await conn.query(sql, [flavorId, lineItemNumber, listingId, orderId, productId, pricePaid, quantity]);

    return true;
};

exports.deleteOrder = async (orderId) => {
    const sql = `DELETE
                FROM        orders
                WHERE       orderId = ?;`;
    await conn.query(sql, [orderId]);

    return true;
};

exports.deleteOrderItem = async (orderId, lineItemNumber) => {
    const sql = `DELETE
                FROM        orderItem
                WHERE       orderId = ? AND lineItemNumber = ?;`;
    await conn.query(sql, [orderId, lineItemNumber]);

    return true;
};

exports.getAllOrders = async () => {
    let sql = `SELECT     *
                FROM        orders AS o
                ORDER BY    o.orderDate DESC, o.orderId DESC;`;
    const [orders,] = await conn.query(sql);

    if (orders.length > 0) {
        sql = `SELECT       *
                FROM        orderItem;`;
        const [orderItems,] = await conn.query(sql);

        orders.forEach(order => {
            order.orderDate = getIsoDate(order.orderDate, "date");
            order.lineItems = orderItems.filter(orderItem => orderItem.orderId === order.orderId);
        });
    }

    return orders;
};

exports.getOrders = async (userId) => {
    const customerId = await getCustomerId(userId);

    let sql = `SELECT       o.orderId, o.orderDate
                FROM        orders AS o
                WHERE       o.customerId = ?
                ORDER BY    o.orderDate DESC, o.orderId DESC;`;
    const [orders,] = await conn.query(sql, [customerId]);

    if (orders.length > 0) {
        const orderIds = orders.map(o => o.orderId);

        sql = `SELECT       *
                FROM        orderItem AS oI
                WHERE       oI.orderId IN (?${", ?".repeat(orderIds.length - 1)});`;
        const [orderItems,] = await conn.query(sql, orderIds);

        orders.forEach(order => {
            order.orderDate = getIsoDate(order.orderDate, "date");
            order.lineItems = orderItems.filter(orderItem => orderItem.orderId === order.orderId);
        });
    }

    return orders;
};

exports.updateOrder = async (orderId, property, value) => {
    const sql = `UPDATE     orders AS o
                SET         o.${property} = ?
                WHERE       o.orderId = ?;`;
    await conn.query(sql, [value, orderId]);

    return true;
};

exports.updateOrderItem = async (orderId, lineItemNumber, property, value) => {
    const sql = `UPDATE     orderItem AS oI
                SET         oI.${property} = ?
                WHERE       oI.orderId = ? AND oI.lineItemNumber = ?;`;

    await conn.query(sql, [value, orderId, lineItemNumber]);

    return true;
};