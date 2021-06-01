const conn = require("./index.js").db;

exports.addInflow = async ({ productId, quantity = 0, dateAdded = null, datePaid = null }) => {
    const sql = `INSERT INTO inflow (productId, quantity, dateAdded, datePaid)
                    VALUES (?, ?, ?, ?)`;
    const [{ insertId: inflowId },] = await conn.query(sql, [productId, quantity, dateAdded, datePaid]);

    return inflowId;
};

exports.deleteInflow = async (inflowId) => {
    const sql = `DELETE
                FROM        inflow
                WHERE       inflowId = ?;`;
    await conn.query(sql, [inflowId]);

    return true;
};

exports.getAllInflows = async () => {
    const sql = `SELECT     *
                FROM        inflow AS i
                ORDER BY    i.dateAdded DESC, i.inflowId DESC;`;
    const [inflows,] = await conn.query(sql);

    return inflows;
};

exports.updateInflow = async (inflowId, property, value) => {
    const sql = `UPDATE     inflow AS i
                SET         i.${property} = ?
                WHERE       i.inflowId = ?;`;
    await conn.query(sql, [value, inflowId]);

    return true;
};