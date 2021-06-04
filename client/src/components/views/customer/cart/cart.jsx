import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { useHistory } from "react-router-dom";
import { Alert, AlertButton } from "components/popovers";
import { CartItem } from "../";
import { formatData, renderArrayString, sumArray } from "utils";
import * as Media from "media";

const CHECKOUT_MODAL_ID = "checkout-modal";
const [ORDER_NEW, ORDER_CONFIRMED, ORDER_FAILED] = ["ORDER_NEW", "ORDER_CONFIRMED", "ORDER_FAILED"];
const ORDER_MINIMUM = 30;

const Cart = () => {
    const history = useHistory();

    const dispatch = useDispatch();

    const isCheckoutOpen = useSelector(state => state.modals.find(m => m.id === CHECKOUT_MODAL_ID));

    const cart = useSelector(state => state.cart);
    const cartTotal = sumArray(cart, c => c.price);

    const [alertState, setAlertState] = useState({ status: ORDER_NEW });

    const openCheckout = () => {
        setAlertState({ status: ORDER_NEW });
        dispatch(actions.modalOpened(CHECKOUT_MODAL_ID));
    };

    const submitOrder = async () => {
        const lineItems = cart.map((c, i) => ({ ...c, lineItemNumber: i + 1, pricePaid: c.price }));

        const res = await dispatch(actions.checkoutOrder({ lineItems, history }));
        if (!res?.success) return setAlertState({ status: ORDER_FAILED, ...res });
        setAlertState({ status: ORDER_CONFIRMED, orderId: res.order.orderId });
    };

    const renderAlert = () => {
        switch (alertState.status) {
            case ORDER_CONFIRMED: {
                const { orderId } = alertState;
                return (
                    <Alert id={CHECKOUT_MODAL_ID} modalClasses="large pad-ctn-1 border-green"
                        icon={<Media.CheckmarkCircleSVG style={{ width: "5rem", height: "5rem" }} />} iconClasses="green-1-fill entry-zoom"
                        heading={["Order ", <span className="green-2">{`# ${orderId}`}</span>, " submitted."]}
                        buttons={[<AlertButton text="Close" onClick={closeAlert => closeAlert()} classes="green-1-bg" />]} hasCancelButton={false} />
                );
            } case ORDER_FAILED: {
                const { deletedItems, updatedItems } = alertState;
                return (
                    <Alert id={CHECKOUT_MODAL_ID} modalClasses="large pad-ctn-1 border-red"
                        icon={<Media.ErrorSVG style={{ width: "5rem", height: "5rem" }} />} iconClasses="red-2-fill entry-zoom"
                        heading="Unable to Place Order" subheading="Please review the following items."
                        buttons={[<AlertButton text="Close" onClick={closeAlert => closeAlert()} classes="red-1-bg" />]} hasCancelButton={false}>
                            {deletedItems?.length > 0 &&
                                <div className="column j-center">
                                    <h2 className="text-center">{renderArrayString(["The following items have been ", <span className="red-2">removed</span>, " due to insufficient inventory:"])}</h2>
                                    <div className="cart">
                                        {deletedItems.map(item => <CartItem key={`${item.cartItemId}-deleted`} {...{ ...item, price: item.pricePaid }} hasButtons={false} />)}
                                    </div>
                                </div>
                            }
                            {updatedItems?.length > 0 &&
                                <div className="column j-center">
                                    <h2 className="text-center">{renderArrayString(["The following items have been ", <span className="orange-2">updated</span>, " due to insufficient inventory:"])}</h2>
                                    <div className="cart">
                                        {updatedItems.flatMap(({ line, newValues }) => [
                                            <CartItem key={`${line.cartItemId}-old`} {...line} hasButtons={false} />,
                                            <Media.ChevronSVG key={`${line.cartItemId}-separator`} className="chevron" />,
                                            <CartItem key={`${line.cartItemId}-new`} {...{ ...line, ...newValues }} hasButtons={false} />
                                        ])}
                                    </div>
                                </div>
                            }
                    </Alert>
                );
            } case ORDER_NEW: default: {
                return (
                    <Alert id={CHECKOUT_MODAL_ID} modalClasses="large pad-ctn-1"
                        icon={<Media.ShoppingCartSVG />} iconClasses="blue-1-fill entry-zoom"
                        heading={["Confirm order for ", <span className="green-2">{`$ ${formatData(cartTotal, "currency")}`}</span>, "."]}
                        subheading="Payment on delivery."
                        buttons={[<AlertButton text="Confirm" onClick={submitOrder} />]} />
                );
            }
        }
    };

    return (
        <div className="cart">
            {cart?.map(cartItem => <CartItem key={cartItem.cartItemId} {...cartItem} />)}

            <div className="order-container">
                <div className="order-total">
                    <span>Total :</span>
                    <span>{`$ ${formatData(cartTotal, "currency")}`}</span>
                </div>

                {cartTotal < ORDER_MINIMUM
                    ? <button className="disabled">{`$ ${formatData(ORDER_MINIMUM - cartTotal, "currency")} more required`}</button>
                    : <button onClick={openCheckout}>Checkout</button>
                }

                {isCheckoutOpen && renderAlert()}
            </div>
        </div>
    );
};

export default Cart;