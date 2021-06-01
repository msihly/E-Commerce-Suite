import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { ItemContext, FlavorChip, QuantityRange, Weights } from "../";
import { formatData, sortArray, sumArray } from "utils";

const ItemModal = ({ cartItemId, listingId }) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const cart = useSelector(state => state.cart);
    const cartItem = cartItemId ? cart.find(c => c.cartItemId === cartItemId) : null;

    const listing = useSelector(state => state.listings.find(l => l.listingId === listingId));

    const product = useSelector(state => state.products.find(p => p.productId === (cartItem?.productId ?? listing?.productId)));
    const flavors = sortArray(product.flavors, "quantity", true, true);

    const [activeFlavor, setActiveFlavor] = useState(flavors.find(f => f.flavorId === cartItem?.flavorId) ?? flavors[0] ?? null);
    const [price, setPrice] = useState(cartItem?.price ?? listing?.listingRates[0]?.price);
    const [quantity, setQuantity] = useState(cartItem?.quantity ?? listing?.listingRates[0]?.quantity);

    const productTotalInCart = sumArray(cart.filter(c => c.cartItemId !== cartItemId && (activeFlavor !== null ? c.flavorId === activeFlavor.flavorId : c.productId === product.productId)), c => c.quantity);
    const availableQuantity = (activeFlavor?.quantity ?? product.quantity) - productTotalInCart;

    const closeModal = () => dispatch(actions.modalClosed(cartItemId ?? listingId));

    const handleSubmit = async () => {
        const flavorId = activeFlavor?.flavorId;
        const res = await dispatch(cartItemId
            ? actions.updateCartItem({ cartItemId, value: { flavorId, price, quantity }, history })
            : actions.createCartItem({ listingId, productId: product.productId, flavorId, price, quantity, history }));
        if (res?.success) toast.info(cartItemId ? "Cart updated" : `${quantity} of ${product?.productName} added to cart`);

        closeModal();
    };

    return (
        <Modal id={cartItemId ?? listingId} classes="pad-ctn-2 item-modal">
            <h2 className="modal-title">{product?.productName}</h2>

            <ItemContext.Provider value={{ activeFlavor, availableQuantity, listingRates: listing?.listingRates, price, product, setActiveFlavor, setPrice, setQuantity, quantity }}>
                {flavors.length > 0 && <>
                    <h4>Select Flavor</h4>
                    <div className="flavors">
                        {flavors.map(flavor => <FlavorChip key={flavor.flavorId} {...{ cartItemId, flavor}} />)}
                    </div>
                </>}

                <h4>{`Select ${listing?.hasWeights ? "Weight" : "Quantity"}`}</h4>
                {listing?.hasWeights ? <Weights /> : <QuantityRange />}
            </ItemContext.Provider>

            <TotalLine label="Total Price :" value={`$ ${formatData(price, "currency")}`} />
            {!listing?.hasWeights && <TotalLine label="Savings :" value={`${formatData(1 - price / (quantity * listing?.listingRates[0].price), "percent")} %`} />}

            <div className="add-buttons">
                <button onClick={closeModal} className="grey-1-bg">Cancel</button>
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </Modal>
    );
};

const TotalLine = ({ label, value }) => (
    <div className="total-line">
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default ItemModal;