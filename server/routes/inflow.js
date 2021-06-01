const { app } = require("../index.js");
const db = require("../db");
const { handleErrors, emptyStringsToNull, validateForm } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");

const reqs = {
    productId: { name: "Product", isRequired: true, type: "integer" },
    quantity: { name: "Quantity", isRequired: true, type: "decimal" },
    dateAdded: { name: "Date Added", type: "date" },
    datePaid: { name: "Date Paid", type: "date" },
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/inflows", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const inflows = await db.getAllInflows();

        return res.send({ success: true, inflows, refreshedAccessToken });
    }));

    /* ---------------------------------- POST ---------------------------------- */
    app.post("/api/inflow", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const inflow = emptyStringsToNull(req.body);

        for (const key in inflow) if (!validateForm(reqs, key, inflow[key], res, refreshedAccessToken)) return;

        const inflowId = await db.addInflow(inflow);

        return res.send({ success: true, inflow: { ...inflow, inflowId }, refreshedAccessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/inflow/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const inflow = emptyStringsToNull(req.body);

        for (const key in inflow) {
            if (!validateForm(reqs, key, inflow[key], res, refreshedAccessToken)) return;

            await db.updateInflow(req.params.id, key, inflow[key]);
        }

        return res.send({ success: true, message: `Inflow #${req.params.id} updated`, refreshedAccessToken });
    }));

    /* --------------------------------- DELETE --------------------------------- */
    app.delete("/api/inflow/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteInflow(req.params.id);

        return res.send({ success: true, message: `Inflow #${req.params.id} deleted`, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }