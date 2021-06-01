import React from "react";
import { useSelector } from "react-redux";
import { getListingSection, getStrainClass } from "components/views/_common";
import { formatData } from "utils";

export const ListItem = ({ children, className = null, flavorId, listingId, price, quantity }) => {
    const { hasWeights, photoUrl, productId, sectionId, title } = useSelector(state => state.listings.find(l => l.listingId === listingId)) ?? {};

    return (
        <div {...{ className }}>
            <ListItemImage {...{ photoUrl, sectionId, title }} />

            <ListItemInfo {...{ flavorId, hasWeights, productId, quantity, title }} />

            <ListItemPrice {...{ price }} />

            {children}
        </div>
    );
};

export const ListItemImage = ({ photoUrl, sectionId, title }) => (
    <img className="item-image" src={photoUrl ?? getListingSection(sectionId)?.thumbSrc} alt={title} />
);

export const ListItemInfo = ({ flavorId, hasWeights, productId, quantity, title }) => {
    const product = useSelector(state => state.products.find(p => p.productId === productId));
    const flavor = product.flavors.find(f => f.flavorId === flavorId);

    return (
        <div className="item-info">
            <span className="item-name">{title}</span>
            {flavor &&
                <span className={`item-flavor ${getStrainClass(flavor.flavorType) ?? ""}`.trim()}>
                    {flavor.flavorName}
                </span>
            }
            <span className="item-quantity">{`Quantity: ${quantity}${hasWeights ? "g" : ""}`}</span>
        </div>
    );
};

export const ListItemPrice = ({ price }) => <div className="item-price">{`$ ${formatData(price, "currency")}`}</div>;