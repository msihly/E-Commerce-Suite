import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { Card as CardBase, CardStockWarning } from "components/cards";
import { ItemModal } from "./";
import { sumArray } from "utils";

const Card = ({ listingId }) => {
    const dispatch = useDispatch();

    const isItemModalOpen = useSelector(state => state.modals.find(m => m.id === listingId))?.isOpen ?? false;
    useEffect(() => () => dispatch(actions.modalClosed(listingId)), [dispatch, listingId]);

    const listing = useSelector(state => state.listings.find(l => l.listingId === listingId));
    const { hasWeights, listingRates, productId } = listing;

    const product = useSelector(state => state.products.find(p => p.productId === productId));

    const cart = useSelector(state => state.cart).filter(c => c.productId === productId);
    const availableQuantity = actions.getAvailableQuantity({ listingRates, product }) - sumArray(cart, c => c.quantity);

    const renderButton = () => {
        if (availableQuantity >= listingRates[0]?.quantity) return <div onClick={() => dispatch(actions.modalOpened(listingId))} className="add">Add to Cart +</div>;
        else if (cart.length > 0) return <div className="add">Check Cart</div>;
        else return <div className="add out-of-stock">Out of Stock</div>;
    };

    return (
        <CardBase {...{ ...listing, product }}>
            <CardStockWarning {...{ hasWeights, listingRates, product }} />
            {renderButton()}
            {isItemModalOpen && <ItemModal {...{ listingId }} />}
        </CardBase>
    );
};

export default Card;