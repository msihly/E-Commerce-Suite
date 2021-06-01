const { app } = require("../index.js");
const db = require("../db");
const { handleErrors, validateForm } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");

const reqs = {
    firstName: { name: "First Name", isRequired: true, maxLen: 255 },
    lastName: { name: "Last Name", maxLen: 255 },
    phoneNumber: { name: "Phone Number", maxLen: 30 },
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/employees", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const employees = await db.getAllEmployees();

        return res.send({ success: true, employees, refreshedAccessToken });
    }));

    /* ---------------------------------- POST ---------------------------------- */
    app.post("/api/employee", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        for (const key in req.body) if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

        const employeeId = await db.addEmployee(req.body);

        return res.send({ success: true, employee: { ...req.body, employeeId }, refreshedAccessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/employee/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        for (const key in req.body) {
            if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

            await db.updateEmployee(req.params.id, key, req.body[key]);
        }

        return res.send({ success: true, message: `Employee #${req.params.id} updated`, refreshedAccessToken });
    }));

    /* --------------------------------- DELETE --------------------------------- */
    app.delete("/api/employee/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteEmployee(req.params.id);

        return res.send({ success: true, message: `Employee #${req.params.id} deleted`, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }