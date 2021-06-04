const { app } = require("../index.js");
const db = require("../db");
const { emptyStringsToNull, getIsoDate, handleErrors, parseJSON, sortArray, validateForm } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");
const { pushNotification } = require("../utils/discord.js");

const reqs = {
    orderDate: { name: "Date", isRequired: true, type: "date" },
    customerId: { name: "Customer", isRequired: true, type: "integer" },
    employeeId: { name: "Employee", isRequired: true, type: "integer" },
    productId: { name: "Product", isRequired: true, type: "integer" },
    quantity: { name: "Quantity", isRequired: true, type: "decimal" },
    pricePaid: { name: "Price Paid", isRequired: true, type: "decimal" },
};

class RunningTotals {
    constructor() { this.totals = []; }

    get(productId, flavorId) { return this.totals.find(t => t.productId === productId && t.flavorId === flavorId)?.total; }

    push(productId, flavorId, quantity) {
        const total = this.get(productId, flavorId);
        if (total === undefined) this.totals.push({ productId, flavorId, total: quantity });
        return total ?? quantity;
    };
};

const getNewFlavor = (flavors, curQuantity, minQuantity) => {
    let validFlavors = flavors.filter(f => f.quantity >= curQuantity);
    if (validFlavors.length === 0) validFlavors = flavors.filter(f => f.quantity >= minQuantity);
    if (validFlavors.length === 0) return false;

    const { flavorId, quantity } = validFlavors.length > 1 ? sortArray(validFlavors, "quantity", true, true)[0] : validFlavors[0];
    return { flavorId, quantity };
};

const getNewRate = (listing, curQuantity, maxQuantity) => {
    const listingRates = sortArray(listing.listingRates, "quantity", true, true);

    if (listing.hasWeights) return listingRates.find(rate => rate.quantity <= maxQuantity);

    const newQuantity = Math.min(curQuantity, maxQuantity);
    const listingRate = listingRates.find(rate => newQuantity >= rate.quantity);
    const unitPrice = listingRate.price / listingRate.quantity;
    return { price: newQuantity * unitPrice, quantity: newQuantity };
};

const validateCart = (lineItems, products, listings) => {
    const [deletedItems, updatedItems] = [[], []];

    const totals = new RunningTotals();

    lineItems.forEach(line => {
        const listing = listings.find(l => l.listingId === line.listingId);
        const product = products.find(p => p.productId === line.productId);
        if ([listing, product].includes(undefined)) return deletedItems.push(line);

        const flavor = product.flavors.find(f => f.flavorId === line.flavorId);
        const minQuantity = listing.listingRates[0]?.quantity;
        if (product.quantity < minQuantity) return deletedItems.push(line);

        const total = totals.get(line.productId, line.flavorId);
        let maxQuantity = flavor?.quantity ?? product.quantity;
        // console.log(`${line.cartItemId}: Running total check`, { total, failureCheck: total + line.quantity > maxQuantity }); // DEBUG

        if (line.quantity > maxQuantity || total + line.quantity > maxQuantity) {
            const newFlavor = product.flavors.length > 0 ? getNewFlavor(product.flavors, line.quantity, minQuantity) : {};
            // console.log(`${line.cartItemId}: New flavor`, { newFlavor, total }); // DEBUG
            if (!newFlavor) return deletedItems.push(line);
            maxQuantity = newFlavor?.quantity ?? maxQuantity;

            const { price, quantity } = getNewRate(listing, line.quantity, total ? maxQuantity - total : maxQuantity) ?? {};
            // console.log(`${line.cartItemId}: New rate`, { price, quantity }); // DEBUG
            if ([price, quantity].includes(undefined) || quantity < minQuantity || total + quantity > maxQuantity) return deletedItems.push(line);

            totals.push(line.productId, newFlavor?.flavorId ?? line.flavorId, quantity);
            return updatedItems.push({ line, newValues: { flavorId: newFlavor?.flavorId ?? line.flavorId, quantity, price }});
        }

        totals.push(line.productId, line.flavorId, line.quantity);
        // console.log(`${line.cartItemId}: No errors`, line); // DEBUG
    });

    return { deletedItems, updatedItems };
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/orders", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const orders = req.user.accessLevel === 1 ? await db.getAllOrders() : await db.getOrders(req.user.userId);

        return res.send({ success: true, orders, refreshedAccessToken });
    }));

    /* ----------------------------------- POST ---------------------------------- */
    app.post("/api/order", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const lineItems = parseJSON(req.body.lineItems);
        for (const line of lineItems) {
            for (const key in line) if (!validateForm(reqs, key, line[key], res, refreshedAccessToken)) return;
        }

        if (req.body.isFromCart) {
            const [listings, products] = await Promise.all([db.getListings(req.user), db.getProducts(req.user)]);

            const { deletedItems, updatedItems } = validateCart(lineItems, products, listings);
            console.log({ deletedItems, updatedItems });

            if (deletedItems.length > 0 || updatedItems.length > 0) {
                if (deletedItems.length > 0) await db.deleteCartItems(deletedItems.map(e => e.cartItemId));
                if (updatedItems.length > 0) await db.updateCartItems(updatedItems);

                return res.send({ success: true, hasErrors: true, deletedItems, updatedItems, listings, products, refreshedAccessToken }); // `success: true` to avoid triggering handleErrors
            }
        } else {
            for (const key in req.body) if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;
        }

        const orderDate = req.body?.orderDate ?? getIsoDate();
        const customerId = req.body?.customerId ?? await db.getCustomerId(req.user.userId);
        const employeeId = req.body?.employeeId ?? null;

        const orderId = await db.addOrder({ orderDate, customerId, employeeId, lineItems });

        if (req.body.isFromCart) {
            await db.emptyCart({ customerId });
            pushNotification(`Order #${orderId} - ${new Date(orderDate).toLocaleString("en-US", { timeZone: "America/New_York" })}`);
        }

        return res.send({
            success: true,
            order: {
                orderId,
                orderDate,
                customerId,
                employeeId,
                lineItems: lineItems.map(line => ({ ...line, orderId }))
            },
            refreshedAccessToken
        });
    }));

    app.post("/api/order/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const { id: orderId } = req.params;
        const body = emptyStringsToNull(req.body);

        for (const key in body) if (!validateForm(reqs, key, body[key], res, refreshedAccessToken)) return;

        await db.addOrderItem({ ...body, orderId });

        return res.send({ success: true, refreshedAccessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/order/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        for (const key in req.body) {
            if (!validateForm(reqs, key, req.body[key], res, refreshedAccessToken)) return;

            await db.updateOrder(req.params.id, key, req.body[key]);
        }

        return res.send({ success: true, message: `Order #${req.params.id} updated`, refreshedAccessToken });
    }));

    app.put("/api/order/:id/:lineItemNumber", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const { id, lineItemNumber } = req.params;
        const body = emptyStringsToNull(req.body);

        for (const key in body) {
            if (!validateForm(reqs, key, body[key], res, refreshedAccessToken)) return;

            await db.updateOrderItem(id, lineItemNumber, key, body[key]);
        }

        return res.send({ success: true, message: `Order #${id} updated`, refreshedAccessToken });
    }));

    /* --------------------------------- DELETE --------------------------------- */
    app.delete("/api/order/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteOrder(req.params.id);

        return res.send({ success: true, message: `Order #${req.params.id} deleted`, refreshedAccessToken });
    }));

    app.delete("/api/order/:id/:lineItemNumber", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const { id, lineItemNumber } = req.params;

        await db.deleteOrderItem(id, lineItemNumber);

        return res.send({ success: true, message: `Order #${req.params.id} deleted`, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }