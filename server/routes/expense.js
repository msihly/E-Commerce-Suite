const db = require("../db");
const { app } = require("../index.js");
const { handleErrors, emptyStringsToNull, validateForm } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");

const reqs = {
    expenseType: { name: "Type", maxLen: 255 },
    expenseDescription: { name: "Description", maxLen: 2083 },
    expenseAmount: { name: "Amount", isRequired: true, type: "decimal" },
    expenseStatus: { name: "Status", maxLen: 255 },
    dateIncurred: { name: "Date Incurred", isRequired: true, type: "date" },
    datePaid: { name: "Date Paid", type: "date" },
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/expenses", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const expenses = await db.getAllExpenses();

        return res.send({ success: true, expenses, refreshedAccessToken });
    }));

    /* ---------------------------------- POST ---------------------------------- */
    app.post("/api/expense", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const expense = emptyStringsToNull(req.body);
        for (const key in expense) if (!validateForm(reqs, key, expense[key], res, refreshedAccessToken)) return;

        const expenseId = await db.addExpense(expense);

        return res.send({ success: true, expense: { ...expense, expenseId }, refreshedAccessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/expense/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const expense = emptyStringsToNull(req.body);

        for (const key in expense) {
            if (!validateForm(reqs, key, expense[key], res, refreshedAccessToken)) return;

            await db.updateExpense(req.params.id, key, expense[key]);
        }

        return res.send({ success: true, message: `Expense #${req.params.id} updated`, refreshedAccessToken });
    }));

    /* --------------------------------- DELETE --------------------------------- */
    app.delete("/api/expense/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteExpense(req.params.id);

        return res.send({ success: true, message: `Expense #${req.params.id} deleted`, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }