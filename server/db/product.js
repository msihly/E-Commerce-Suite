const conn = require("./index.js").db;
const { castObjectNumbers, getIsoDate } = require("../utils");

/* --------------------------------- PRODUCT -------------------------------- */
exports.addProduct = async ({ dateAdded, productDescription = null, productName, productType, unitPrice }) => {
    const sql = `INSERT INTO product (dateAdded, productDescription, productName, productType, unitPrice)
                    VALUES (?, ?, ?, ?, ?);`;
    const [{ insertId: productId },] = await conn.query(sql, [dateAdded, productDescription, productName, productType, unitPrice]);

    return productId;
};

exports.deleteProduct = async (productId) => {
    const sql = `DELETE
                FROM        product
                WHERE       productId = ?;`;
    await conn.query(sql, [productId]);

    return true;
};

exports.getProducts = async ({ accessLevel, productIds = [] }) => {
    const sql = `SELECT		${accessLevel === 1 ? "p.*" : "p.productId, p.productName, p.productType, p.productDescription"},
                            IFNULL(SUM(i.quantity), 0) - IFNULL((
                                SELECT		SUM(oI.quantity)
                                FROM		orderItem AS oI
                                WHERE		oI.productId = p.productId
                                GROUP BY	oI.productId
                            ), 0) AS quantity
                FROM        product AS p LEFT JOIN inflow AS i
                                ON p.productId = i.productId
                ${productIds.length > 0 ? `WHERE p.productId IN (?${", ?".repeat(productIds.length - 1)})` : ""}
                GROUP BY	p.productId;`;
    const [products,] = await conn.query(sql, productIds);

    const flavors = await this.getFlavors(productIds);

    products.forEach(p => {
        p.flavors = flavors.filter(f => f.productId === p.productId);
        if (accessLevel === 1) p.dateAdded = getIsoDate(p.dateAdded);
    });

    return products.map(p => ({ ...castObjectNumbers(p, "flavors") }));
};

exports.updateProduct = async (productId, property, value) => {
    const sql = `UPDATE     product AS p
                SET         p.${property} = ?
                WHERE       p.productId = ?;`;
    await conn.query(sql, [value, productId]);

    return true;
};

/* --------------------------------- FLAVOR --------------------------------- */
exports.addFlavor = async ({ flavorName, productId }) => {
    const sql = `INSERT INTO flavor (flavorName, productId) VALUES (?, ?);`;
    const [{ insertId: flavorId },] = await conn.query(sql, [flavorName, productId]);

    return flavorId;
};

exports.deleteFlavor = async (flavorId) => {
    const sql = `DELETE
                FROM        flavor
                WHERE       flavorId = ?;`;
    await conn.query(sql, [flavorId]);

    return true;
};

exports.getFlavors = async (productIds = []) => {
    const sql = `SELECT     p.productId, f.flavorId, f.flavorName, f.flavorType,
                            IFNULL(SUM(i.quantity), 0) - IFNULL((
                                SELECT		SUM(oI.quantity)
                                FROM		orderItem AS oI
                                WHERE		oI.flavorId = f.flavorId
                                GROUP BY	oI.flavorId
                            ), 0) AS quantity
                FROM	    product AS p INNER JOIN flavor AS f
                                ON p.productId = f.productId
                            LEFT JOIN inflow AS i
                                ON f.flavorId = i.flavorId
                ${productIds.length > 0 ? `WHERE p.productId IN (?${", ?".repeat(productIds.length - 1)})` : ""}
                GROUP BY	f.flavorId;`;
    const [flavors,] = await conn.query(sql, productIds);

    return flavors.map(f => ({ ...castObjectNumbers(f) }));
};

exports.updateFlavor = async (flavorId, flavorName) => {
    const sql = `UPDATE     flavor AS f
                SET         f.flavorName = ?
                WHERE       f.flavorId = ?;`;
    await conn.query(sql, [flavorName, flavorId]);

    return true;
};