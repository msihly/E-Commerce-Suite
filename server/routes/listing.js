const { app } = require("../index.js");
const db = require("../db");
const { handleErrors, hash, emptyStringsToNull, parseJSON, validateForm } = require("../utils");
const { authenticateUser } = require("../utils/auth.js");
const { uploadPhoto } = require("../utils/upload.js");

const reqs = {
    hasWeights: { type: "integer" },
    listingState: { name: "Status", isRequired: true, maxLen: 9 },
    sectionId: { type: "integer" },
    strainType: { name: "Strain Type", maxLen: 6 },
    title: { name: "Title", isRequired: true, maxLen: 2083 },
    quantity: { name: "Quantity", type: "decimal" },
    price: { name: "Price", type: "decimal" }
};

const validateListing = (req, res, refreshedAccessToken) => {
    const listingRates = parseJSON(req.body.listingRates).map(rate => emptyStringsToNull(rate));
    for (rate of listingRates) {
        for (const key in rate) if (!validateForm(reqs, key, rate[key], res, refreshedAccessToken)) return {};
    }

    const listing = emptyStringsToNull({ ...req.body, listingRates, hasWeights: req.body.hasWeights ? 1 : 0 });
    for (const key in listing) if (!validateForm(reqs, key, listing[key], res, refreshedAccessToken)) return {};

    return { listing, listingRates };
};

try {
    /* ----------------------------------- GET ---------------------------------- */
    app.get("/api/listings", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req);

        const listings = await db.getListings({ ...req.user });

        return res.send({ success: true, listings, refreshedAccessToken });
    }));

    /* ----------------------------------- POST ---------------------------------- */
    app.post("/api/listings", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        const { listing } = validateListing(req, res, refreshedAccessToken);
        if (!listing) return;

        const { photoId, photoUrl } = await uploadPhoto(req.files[0]);

        const listingId = await db.addListing({ ...listing, photoId });

        return res.send({ success: true, listing: { ...listing, listingId, photoId, photoUrl }, refreshedAccessToken });
    }));

    /* ----------------------------------- PUT ---------------------------------- */
    app.put("/api/listings/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);
        const listingId = req.params.id;

        const { listing: updated } = validateListing(req, res, refreshedAccessToken);
        if (!updated) return;

        await db.getListings({ ...req.user, listingIds: [listingId] }).then(async current => {
            let photoId, photoUrl;

            if (req.files.length > 0) {
                if (current.photoId == null) {
                    const photo = await uploadPhoto(req.files[0]);
                    [photoId, photoUrl] = [photo.photoId, photo.photoUrl];
                } else {
                    const currentPhoto = await db.getPhotos({ photoIds: [current.photoId] })[0];
                    if (currentPhoto.photoHash === hash("md5", req.files[0].buffer)) [photoId, photoUrl] = [current.photoId, current.photoUrl];
                    else {
                        const photo = await uploadPhoto(req.files[0]);
                        [photoId, photoUrl] = [photo.photoId, photo.photoUrl];
                    }
                }
            } else if (updated.isImageRemoved) [photoId, photoUrl] = [null, null];

            const listingRates = await db.updateListing({ ...updated, listingId, photoId });

            return res.send({ success: true, listing: { ...updated, listingId, listingRates, photoId, photoUrl }, refreshedAccessToken });
        });
    }));

    /* ----------------------------------- DELETE ---------------------------------- */
    app.delete("/api/listings/:id", handleErrors(async (req, res) => {
        const refreshedAccessToken = await authenticateUser(req, true);

        await db.deleteListing(req.params.id);

        return res.send({ success: true, refreshedAccessToken });
    }));
} catch (e) { console.error(e); }