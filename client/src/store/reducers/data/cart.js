import * as types from "store/actions/types";

const initState = [];

const cart = (state = initState, action) => {
    switch (action.type) {
        case types.CART_ITEM_CREATED: {
            return [...state, action.payload];
        } case types.CART_ITEM_DELETED: {
            const { id } = action.payload;
            return state.filter(cartItem => cartItem.cartItemId !== id);
        } case types.CART_ITEM_UPDATED: {
            const { id, value } = action.payload;
            return state.map(cartItem => cartItem.cartItemId === id ? { ...cartItem, ...value } : cartItem);
        } case types.CART_RETRIEVED: {
            const { cart } = action.payload;
            return cart.length > 0 ? state.concat(cart) : state;
        } case types.CART_EMPTIED: case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default cart;