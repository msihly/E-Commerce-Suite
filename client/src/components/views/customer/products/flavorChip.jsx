import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { getStrainClass } from "components/views/_common";
import { ItemContext } from "components/views/customer";
import { sumArray } from "utils";

const FlavorChip = ({ cartItemId, flavor, flavor: { flavorId, flavorName, flavorType, quantity } }) => {
    const { activeFlavor, listingRates, setActiveFlavor } = useContext(ItemContext);

    const cart = useSelector(state => state.cart);

    const availableQuantity = quantity - sumArray(cart.filter(c => c.cartItemId !== cartItemId && c.flavorId === flavorId), c => c.quantity);

    const getClasses = () => {
        let className = "flavor-chip";
        if (activeFlavor?.flavorId === flavorId) className += " active";
        if (availableQuantity < listingRates[0].quantity) className += " disabled";
        return className;
    };

    const handleClick = () => {
        if (availableQuantity < listingRates[0].quantity) return;
        setActiveFlavor(flavor);
    };

    return (
        <span key={flavorId} className={getClasses()} onClick={handleClick}>
            {flavorType && <span className={`flavor-strain ${getStrainClass(flavorType)}`}>{flavorType.substring(0, 1)}</span>}
            <span className="flavor-name">{flavorName}</span>
            <span className="flavor-quantity">{availableQuantity}</span>
        </span>
    );
};

export default FlavorChip;