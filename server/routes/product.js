const { app } = require("../index.js");
const db = require("../db");
const { handleErrors, getIsoDate, validateForm, emptyStringsToNull } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");

const reqs = {
    productName: { name: "Name", isRequired: true, maxLen: 2083 },
    productType: { name: "Type", isRequired: true, maxLen: 255 },
    productDescription: { name: "Description", maxLen: 2083 },
    unitPrice: { name: "Unit Price", isRequired: true, type: "decimal" },
    dateAdded: { name: "Date Added", type: "date" },
    flavorName: { name: "Flavor", isRequired: true, minLen: 1, maxLen: 255 }
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/products", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const products = await db.getProducts({ accessLevel: req.user.accessLevel });

        return res.send({ success: true, products, refreshedAccessToken });
    }));

    /* ---------------------------------- POST ---------------------------------- */
    app.post("/api/product", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const product = emptyStringsToNull({ ...req.body, dateAdded: req.body.dateAdded ?? getIsoDate() });

        for (const key in product) if (!validateForm(reqs, key, product[key], res, refreshedAccessToken)) return;

        const productId = await db.addProduct(product);

        return res.send({ success: true, product: { ...product, productId, flavors: [] }, refreshedAccessToken });
    }));

    app.post("/api/product/flavor", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const { flavorName, productId } = req.body;

        for (const key in req.body) if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

        const flavorId = await db.addFlavor({ flavorName, productId });

        return res.send({ success: true, flavor: { flavorId, flavorName, productId }, refreshedAccessToken})
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/product/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const body = emptyStringsToNull(req.body);

        for (const key in body) {
            if (!validateForm(reqs, key, body[key], res, refreshedAccessToken)) return;

            await db.updateProduct(req.params.id, key, body[key]);
        }

        return res.send({ success: true, message: `Product #${req.params.id} updated`, refreshedAccessToken });
    }));

    app.put("/api/product/flavor/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        for (const key in req.body) if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

        await db.updateFlavor(req.params.id, req.body.flavorName);

        return res.send({ success: true, message: `Flavor #${req.params.id} updated`, refreshedAccessToken });
    }));

    /* --------------------------------- DELETE --------------------------------- */
    app.delete("/api/product/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteProduct(req.params.id);

        return res.send({ success: true, message: `Product #${req.params.id} deleted`, refreshedAccessToken });
    }));

    app.delete("/api/product/flavor/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteFlavor(req.params.id);

        return res.send({ success: true, message: `Flavor #${req.params.id} deleted`, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }