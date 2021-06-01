import React, { cloneElement } from "react";
import { useSelector } from "react-redux";
import { Card } from "./";
import { sortArray } from "utils";

const Cards = ({ cardBase = <Card />, hasSort = true, listings }) => {
    const products = useSelector(state => state.products);

    const sortedListings = !hasSort ? listings : sortArray(sortArray(listings.map(l => ({
        ...l,
        lowestPrice: l.listingRates[0].price,
        isInStock: products.find(p => p.productId === l.productId)?.quantity >= l.listingRates[0].quantity
    })), "lowestPrice", false, true), "isInStock");

    return (
        <div className="card-container">
            {sortedListings.length > 0
                ? sortedListings.map(listing => cloneElement(cardBase, { key: listing.listingId, ...listing }))
                : <h2>No listings found</h2>
            }
        </div>
    );
};

export default Cards;