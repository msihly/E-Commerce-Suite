import { toast } from "react-toastify";
import * as actions from "../";
import * as types from "../types";
import { castObjectNumbers } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const cartItemCreated = (cartItemId, flavorId, listingId, productId, price, quantity) => ({
    type: types.CART_ITEM_CREATED,
    payload: { cartItemId, flavorId, listingId, productId, price, quantity }
});

export const cartItemDeleted = (id) => ({
    type: types.CART_ITEM_DELETED,
    payload: { id }
});

export const cartItemUpdated = (id, value) => ({
    type: types.CART_ITEM_UPDATED,
    payload: { id, value }
});

export const cartEmptied = () => ({
    type: types.CART_EMPTIED,
    payload: { }
});

export const cartRetrieved = (cart) => ({
    type: types.CART_RETRIEVED,
    payload: { cart }
});

/* -------------------------------- THUNKS ------------------------------- */
export const checkoutOrder = ({ lineItems, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/order", {
        method: "POST",
        body: JSON.stringify({ lineItems, isFromCart: true }),
        headers: { "Content-Type": "application/json" }
    });

    console.log(res); // DEBUG

    if (res?.hasErrors) {
        const { deletedItems, updatedItems, listings, products } = res;

        dispatch(actions.listingsUpdated(actions.initializeListings(listings)));
        dispatch(actions.productsUpdated(actions.initializeProducts(products)));

        deletedItems.forEach(item => dispatch(cartItemDeleted(item.cartItemId)));
        updatedItems.forEach(item => dispatch(cartItemUpdated(item.line.cartItemId, item.newValues)));

        return { success: false, deletedItems, updatedItems };
    }

    const order = castObjectNumbers(res.order);
    dispatch(actions.orderCreated(order));

    order.lineItems.forEach(({ flavorId, productId, quantity }) => {
        const product = actions.getProduct(productId);
        const attributes = { quantity: product.quantity - quantity };
        if (product.flavors.length > 0) attributes.flavors = product.flavors.map(f => f.flavorId === flavorId ? { ...f, quantity: f.quantity - quantity } : f);

        dispatch(actions.productUpdated(productId, attributes));
    });

    dispatch(emptyCart(history));

    toast.success(`Order #${order.orderId} created`);
    return { success: true, order };
}, { hasToast: true, isAuth: true, history });

export const createCartItem = ({ flavorId, listingId, productId, price, quantity, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/cart", {
        method: "POST",
        body: JSON.stringify({ flavorId, listingId, productId, price, quantity }),
        headers: { "Content-Type": "application/json" }
    });

    dispatch(cartItemCreated(res.cartItemId, flavorId, listingId, productId, price, quantity));

    return res;
}, { hasToast: true, isAuth: true, history });

export const deleteCartItem = ({ cartItemId, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/cart/${cartItemId}`, { method: "DELETE" });

    dispatch(cartItemDeleted(cartItemId));

    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const emptyCart = (history) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/cart`, { method: "DELETE" });

    dispatch(cartEmptied());

    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getCart = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/cart", { method: "GET" });

    const cart = res.cart.map(c => castObjectNumbers(c));
    dispatch(cartRetrieved(cart));

    return { success: true, cart };
}, { hasToast: true, isAuth: true, history });

export const updateCartItem = ({ cartItemId, value, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/cart/${cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ ...value }),
        headers: { "Content-Type": "application/json" }
    });

    dispatch(cartItemUpdated(cartItemId, value));

    return { success: true };
}, { hasToast: true, isAuth: true, history });