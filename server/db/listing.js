const conn = require("./index.js").db;
const { getCustomerId } = require("./customer.js");
const { castObjectNumbers, getIsoDate } = require("../utils");
const { AUTO_INCREMENT_STEP } = process.env;

/* --------------------------------- LISTING -------------------------------- */
exports.addListing = async ({ hasWeights = 0, listingRates, listingState, photoId = null, productId, sectionId, strainType = null, title }) => {
    try {
        await conn.query("START TRANSACTION");

        const sql = `INSERT INTO listing (hasWeights, listingState, photoId, productId, sectionId, strainType, title, dateAdded)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
        const [{ insertId: listingId },] = await conn.query(sql, [hasWeights, listingState, photoId, productId, sectionId, strainType, title, getIsoDate()]);

        await this.addListingRates(listingId, listingRates);

        await conn.query("COMMIT");

        return listingId;
    } catch (e) {
        await conn.query("ROLLBACK");
        throw new Error(e);
    }
};

exports.deleteListing = async (listingId) => {
    const sql = `DELETE
                FROM        listing
                WHERE       listingId = ?;`;
    await conn.query(sql, [listingId]);

    return true;
};

exports.getListings = async ({ accessLevel, listingIds = [], userId }) => {
    const sql = `SELECT     l.*, p.photoUrl
                FROM        listing AS l LEFT JOIN photo AS p
                                ON l.photoId = p.photoId
                ${listingIds.length > 0
                    ? `WHERE l.listingId IN (?${", ?".repeat(listingIds.length - 1)})`
                    : (accessLevel === 0 ? `WHERE l.listingState = 'Published' OR l.listingId IN (
                        SELECT      oI.listingId
                        FROM        orders AS o INNER JOIN orderItem AS oI
                                        ON o.orderId = oI.orderId
                        WHERE       o.customerId = ${await getCustomerId(userId)}
                    )` : "")
                };`;
    const [listings,] = await conn.query(sql, listingIds);

    const listingRates = await this.getListingRates(listings.map(l => l.listingId));
    listings.forEach(l => l.listingRates = listingRates.filter(rate => rate.listingId === l.listingId));

    return listings.map(l => ({ ...castObjectNumbers(l, "listingRates") }));
};

exports.updateListing = async ({ hasWeights = 0, listingRates, listingId, listingState, photoId, productId, sectionId, strainType = null, title }) => {
    try {
        await conn.query("START TRANSACTION");

        const props = [hasWeights, listingState, productId, sectionId, strainType, title, photoId, listingId].filter(e => e !== undefined);
        const sql = `UPDATE     listing AS l
                     SET        l.hasWeights = ?, l.listingState = ?, l.productId = ?, l.sectionId = ?, l.strainType = ?, l.title = ?
                                ${photoId !== undefined ? ", l.photoId = ?" : ""}
                     WHERE      l.listingId = ?;`;
        await conn.query(sql, props);

        const existingRates = listingRates.filter(rate => rate.listingRateId !== undefined);

        const removedRates = existingRates.filter(rate => rate.quantity === null || rate.price === null);
        const removedRateIds = removedRates.map(rate => rate.listingRateId);

        const updatedRates = existingRates.filter(rate => !removedRates.includes(rate));

        let addedRates = listingRates.filter(rate => rate.listingRateId === undefined && rate.quantity !== null && rate.price !== null);

        if (addedRates.length > 0) {
            const listingRateIds = await this.addListingRates(listingId, addedRates);
            addedRates = addedRates.map((rate, i) => ({ ...rate, listingRateId: listingRateIds[i] }));
        }
        if (removedRates.length > 0) await this.deleteListingRates(removedRateIds);
        if (updatedRates.length > 0) await this.updateListingRates(updatedRates);

        await conn.query("COMMIT");

        return updatedRates.concat(addedRates);
    } catch (e) {
        await conn.query("ROLLBACK");
        throw new Error(e);
    }
};

/* ------------------------------ LISTING RATES ----------------------------- */
exports.addListingRates = async (listingId, listingRates = []) => {
    if (listingRates.length === 0) return false;
    const validRates = listingRates.filter(rate => !(rate.quantity === null || rate.price === null));

    const sql = `INSERT INTO listingRate (listingId, quantity, price)
    VALUES (?, ?, ?)${", (?, ?, ?)".repeat(validRates.length - 1)};`;

    const [{ insertId: firstId },] = await conn.query(sql, validRates.flatMap(rate => [listingId, rate.quantity, rate.price]));

    return validRates.length > 1 ? validRates.map((_, i) => i * AUTO_INCREMENT_STEP + firstId) : [firstId];
};

exports.deleteListingRates = async (listingRateIds = []) => {
    if (listingRateIds.length === 0) return false;

    const sql = `DELETE FROM listingRate WHERE listingRateId IN (?${", ?".repeat(listingRateIds.length - 1)});`;
    await conn.query(sql, listingRateIds);

    return true;
};

exports.getListingRates = async (listingIds = []) => {
    const sql = `SELECT     lR.*
                FROM        listingRate AS lR
                ${listingIds.length > 0 ? `WHERE lR.listingId IN (?${", ?".repeat(listingIds.length - 1)})` : ""};`;
    const [listingRates,] = await conn.query(sql, listingIds);

    return listingRates;
};

exports.updateListingRates = async (listingRates = []) => {
    if (listingRates.length === 0) return false;

    const props = [].concat(listingRates.map(rate => [rate.listingRateId, rate.quantity]),
                            listingRates.map(rate => [rate.listingRateId, rate.price]),
                            listingRates.map(rate => rate.listingRateId)).flat();
    const sql = `UPDATE     listingRate AS lR
                 SET        lR.quantity = (CASE ${"WHEN lR.listingRateId = ? THEN ? ".repeat(listingRates.length)}END),
                            lR.price = (CASE ${"WHEN lR.listingRateId = ? THEN ? ".repeat(listingRates.length)}END)
                 WHERE      lR.listingRateId IN (?${", ?".repeat(listingRates.length - 1)});`;
    await conn.query(sql, props);

    return true;
};