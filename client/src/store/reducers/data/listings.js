import * as types from "store/actions/types";

const initState = [];

const listings = (state = initState, action) => {
    switch (action.type) {
        case types.LISTING_CREATED: {
            return [...state, action.payload.listing];
        } case types.LISTING_DELETED: {
            const { id } = action.payload;
            return state.filter(l => l.listingId !== id);
        } case types.LISTING_UPDATED: {
            const { id, listing } = action.payload;
            return state.map(l => l.listingId === id ? { ...l, ...listing } : l);
        } case types.LISTINGS_RETRIEVED: {
            const { listings } = action.payload;
            return listings.length > 0 ? state.concat(listings) : state;
        } case types.LISTINGS_UPDATED: {
            const { listings } = action.payload;
            return state.map(listing => {
                const updatedListing = listings.find(l => l.listingId === listing.listingId);
                return updatedListing ? { ...listing, ...updatedListing } : listing;
            });
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default listings;