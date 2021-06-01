import React, { useContext, useEffect } from "react";
import { ItemContext } from "components/views/customer";

export const Weights = () => {
    const { activeFlavor, availableQuantity, listingRates, price, quantity, setPrice, setQuantity } = useContext(ItemContext);

    const selectWeight = (q, p) => {
        if (availableQuantity < q) return;
        setQuantity(q);
        setPrice(p);
    };

    useEffect(() => {
        if (availableQuantity < quantity) {
            for (let i = listingRates.length - 1; i >= 0; i--) {
                if (availableQuantity >= listingRates[i].quantity) {
                    selectWeight(listingRates[i].quantity, listingRates[i].price);
                    break;
                }
            }
        }
    }, [activeFlavor, listingRates, setPrice, setQuantity]); //eslint-disable-line

    return (
        <div className="weights">
            {listingRates.map((rate, i) => <WeightButton key={i} price={rate.price} weight={rate.quantity} handleClick={selectWeight} isActive={price === rate.price} />)}
        </div>
    );
};

export const WeightButton = ({ isActive, handleClick, price, weight }) => {
    const { availableQuantity } = useContext(ItemContext);

    const getButtonClasses = () => {
        let className = "weight-btn";
        if (isActive) className += " active";
        if (availableQuantity < weight) className += " out-of-stock";
        return className;
    };

    return (
        <div onClick={() => handleClick(weight, price)} className={getButtonClasses()}>
            <span>{`${weight}g`}</span>
            <span>{price}</span>
        </div>
    );
};