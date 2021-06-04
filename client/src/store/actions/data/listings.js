import store from "store";
import * as types from "../types";
import { castObjectNumbers, sumArray } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const listingCreated = (listing) => ({
    type: types.LISTING_CREATED,
    payload: { listing }
});

export const listingDeleted = (id) => ({
    type: types.LISTING_DELETED,
    payload: { id }
});

export const listingUpdated = (id, listing) => ({
    type: types.LISTING_UPDATED,
    payload: { id, listing }
});

export const listingsRetrieved = (listings) => ({
    type: types.LISTINGS_RETRIEVED,
    payload: { listings }
});

export const listingsUpdated = (listings) => ({
    type: types.LISTINGS_UPDATED,
    payload: { listings }
});

/* -------------------------------- THUNKS ------------------------------- */
export const createListing = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/listings", { method: "POST", body: formData });

    const listing = castObjectNumbers(res.listing, "listingRates");
    dispatch(listingCreated(listing));

    return { success: true, listing };
}, { hasToast: true, isAuth: true, history });

export const deleteListing = ({ listingId, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/listings/${listingId}`, { method: "DELETE" });

    dispatch(listingDeleted(listingId));

    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getListings = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/listings", { method: "GET" });

    const listings = initializeListings(res.listings);
    dispatch(listingsRetrieved(listings));

    return { success: true, listings };
}, { hasToast: true, isAuth: true, history });

export const updateListing = ({ listingId, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/listings/${listingId}`, { method: "PUT", body: formData });

    const listing = castObjectNumbers(res.listing, "listingRates");
    dispatch(listingUpdated(listingId, listing));

    return { success: true, listing };
}, { hasToast: true, isAuth: true, history });

/* ---------------------------------- UTILS --------------------------------- */
export const getListing = (listingId) => store.getState().listings.find(l => l.listingId === listingId);

export const getAvailableQuantity = ({ listingRates, product }) => {
    if ([listingRates, product].includes(undefined)) return false;
    return product.flavors.length > 0 ? sumArray(product.flavors, f => f.quantity >= listingRates[0]?.quantity ? f.quantity : 0) : product.quantity;
};

export const initializeListings = (listings) => listings.map(l => castObjectNumbers(l, "listingRates"));