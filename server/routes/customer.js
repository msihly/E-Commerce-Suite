const { app } = require("../index.js");
const db = require("../db");
const { emptyStringsToNull, handleErrors, validateForm } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");
const { APP_URL } = process.env;

const reqs = {
    firstName: { name: "First Name", isRequired: true, maxLen: 255 },
    lastName: { name: "Last Name", maxLen: 255 },
    street: { name: "Street", maxLen: 255 },
    city: { name: "City", maxLen: 255 },
    state: { name: "State", maxLen: 255 },
    zipCode: { name: "Zip Code", maxLen: 30 },
    phoneNumber: { name: "Phone Number", maxLen: 30 },
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/customers", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const customers = await db.getAllCustomers();

        return res.send({ success: true, customers, refreshedAccessToken });
    }));

    /* ---------------------------------- POST ---------------------------------- */
    app.post("/api/customer", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const body = emptyStringsToNull(req.body);
        for (const key in body) if (!validateForm(reqs, key, body[key], res, refreshedAccessToken)) return;

        const customerId = await db.addCustomer(body);

        return res.send({ success: true, customer: { ...req.body, customerId }, refreshedAccessToken });
    }));

    app.post("/api/customer/:id/invite", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const inviteToken = await db.createInvitation(req.params.id);
        const invitation = `${APP_URL}/invite/${inviteToken}`;

        return res.send({ success: true, invitation, refreshedAccessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/customer/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true); // SHOULD NON_ADMIN BE ABLE TO ACCESS ?? TEST

        for (const key in req.body) {
            if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

            await db.updateCustomer(req.params.id, key, req.body[key]);
        }

        return res.send({ success: true, message: `Customer #${req.params.id} updated`, refreshedAccessToken });
    }));

    /* --------------------------------- DELETE --------------------------------- */
    app.delete("/api/customer/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteCustomer(req.params.id);

        return res.send({ success: true, message: `Customer #${req.params.id} deleted`, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }