import React from "react";
import * as actions from "store/actions";
import { getListingSection, getStrainClass } from "components/views/_common";
import { sortArray } from "utils";

export const Card = ({ children, className = "", listingRates, photoUrl, product, sectionId, strainType, title }) => (
    <div className={`card ${className}`.trim()}>
        <CardImage {...{ photoUrl, sectionId }} />

        <CardTitles {...{ strainType, title }} />

        <CardPrices {...{ listingRates, product }} />

        {children}
    </div>
);

export const CardImage = ({ photoUrl, sectionId }) => <img src={photoUrl ?? getListingSection(sectionId)?.thumbSrc} className="product-image" alt="" />;

export const CardTitles = ({ title, strainType }) => (
    <div className="title">
        <span>{title ?? "No Title"}</span>
        {strainType && <span className={`subtitle${strainType ? ` ${getStrainClass(strainType)}` : ""}`}>{strainType}</span>}
    </div>
);

export const CardPrices = ({ listingRates, product }) => {
    if (!listingRates) return false;

    const checkIsValid = (e) => !["", null, undefined].includes(e);

    const rates = sortArray(listingRates.filter(r => checkIsValid(r.quantity) && checkIsValid(r.price)), "quantity", false, true);

    const totalAvailable = actions.getAvailableQuantity({ listingRates, product });

    return (
        <div className="prices">
            {rates.map((rate, i) =>
                <div key={rate.listingRateId ?? i} className={`card-price${totalAvailable < rate.quantity ? " out-of-stock" : ""}`}>
                    <span className="weight">{rate.quantity}</span>
                    <span className="price">{rate.price}</span>
                </div>
            )}
        </div>
    );
};

export const CardStockWarning = ({ hasWeights, listingRates, product }) => {
    if (!listingRates) return false;

    const availableQuantity = actions.getAvailableQuantity({ listingRates, product });
    const minQuantity = listingRates[0].quantity;
    const lowStockThreshold = hasWeights ? listingRates[listingRates.length - 1].quantity : minQuantity * 5;

    return availableQuantity < lowStockThreshold && availableQuantity >= minQuantity
        && <div className="stock-warning">Low Stock</div>;
};