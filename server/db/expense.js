const conn = require("./index.js").db;
const { getIsoDate } = require("../utils");

exports.addExpense = async ({ dateIncurred, datePaid = null, expenseAmount, expenseDescription = null, expenseStatus = null, expenseType = null, payeeId = null }) => {
    const sql = `INSERT INTO expense (expenseAmount, dateIncurred, datePaid, expenseDescription, payeeId, expenseStatus, expenseType)
                    VALUES (?, ?, ?, ?, ?, ?, ?);`;
    const [{ insertId: expenseId },] = await conn.query(sql, [expenseAmount, dateIncurred, datePaid, expenseDescription, payeeId, expenseStatus, expenseType]);

    return expenseId;
};

exports.deleteExpense = async (expenseId) => {
    const sql = `DELETE
                FROM        expense
                WHERE       expenseId = ?;`;
    await conn.query(sql, [expenseId]);

    return true;
};

exports.getAllExpenses = async () => {
    const sql = `SELECT     *
                FROM        expense AS e
                ORDER BY    e.dateIncurred DESC, e.expenseId DESC`;
    const [expenses,] = await conn.query(sql);

    expenses.forEach(expense => expense.dateIncurred = getIsoDate(expense.dateIncurred));

    return expenses;
};

exports.updateExpense = async (expenseId, property, value) => {
    const sql = `UPDATE     expense AS e
                SET         e.${property} = ?
                WHERE       e.expenseId = ?;`;
    await conn.query(sql, [value, expenseId]);

    return true;
};