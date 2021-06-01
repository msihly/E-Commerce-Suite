import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { Card as CardBase, CardStockWarning } from "components/cards";
import { Editor } from "./";

const Card = ({ listingId }) => {
    const dispatch = useDispatch();

    const isEditorOpen = useSelector(state => state.modals.find(m => m.id === listingId))?.isOpen ?? false;
    useEffect(() => () => dispatch(actions.modalClosed(listingId)), [dispatch, listingId]);

    const listing = useSelector(state => state.listings.find(l => l.listingId === listingId));
    const { hasWeights, listingRates, productId } = listing;

    const product = useSelector(state => state.products.find(p => p.productId === productId));

    return (
        <CardBase {...{ ...listing, product }}>
            <CardStockWarning {...{ hasWeights, listingRates, product }} />

            <div onClick={() => dispatch(actions.modalOpened(listingId))} className="add">Edit Listing</div>

            {isEditorOpen && <Editor {...{ listingId }} />}
        </CardBase>
    );
};

export default Card;