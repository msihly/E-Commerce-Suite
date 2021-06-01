const conn = require("./index.js").db;

exports.addEmployee = async ({ firstName, lastName = null, phoneNumber = null }) => {
    const sql = `INSERT INTO employee (firstName, lastName, phoneNumber)
                    VALUES (?, ?, ?);`;
    const [{ insertId: employeeId },] = await conn.query(sql, [firstName, lastName, phoneNumber]);
    return employeeId;
};

exports.deleteEmployee = async (employeeId) => {
    const sql = `DELETE
                FROM        employee
                WHERE       employeeId = ?;`;
    await conn.query(sql, [employeeId]);
    return true;
};

exports.getAllEmployees = async () => {
    const sql = `SELECT     *
                FROM        employee AS e
                ORDER BY    e.employeeId DESC`;
    const [employees,] = await conn.query(sql);

    return employees;
};

exports.updateEmployee = async (employeeId, property, value) => {
    const sql = `UPDATE     employee AS e
                SET         e.${property} = ?
                WHERE       e.employeeId = ?;`;
    await conn.query(sql, [value, employeeId]);

    return true;
};
