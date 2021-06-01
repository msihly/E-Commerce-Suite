import React, { useContext, useEffect } from "react";
import { ItemContext } from "../";
import { sortArray } from "utils";

const QuantityRange = () => {
    const { activeFlavor, availableQuantity, listingRates, setPrice, setQuantity, quantity } = useContext(ItemContext);

    const updateRange = (newQuantity) => {
        if (newQuantity < 1 || availableQuantity < newQuantity) return;
        const listingRate = sortArray(listingRates, "quantity", true, true).find(rate => newQuantity >= rate.quantity);
        const unitPrice = listingRate.price / listingRate.quantity;

        setPrice(newQuantity * unitPrice);
        setQuantity(newQuantity);
    };

    useEffect(() => {
        if (availableQuantity < quantity) updateRange(availableQuantity);
    }, [activeFlavor, availableQuantity, listingRates, quantity]); //eslint-disable-line

    return (
        <div className="quantity-range">
            <span className={`circle-button${quantity === 1 ? " disabled" : ""}`} onClick={() => updateRange(quantity - 1)}>-</span>
            <span className="quantity-counter">{quantity}</span>
            <span className={`circle-button${quantity >= availableQuantity ? " disabled" : ""}`}
                onClick={() => updateRange(quantity + 1)}>+</span>
        </div>
    );
};

export default QuantityRange;