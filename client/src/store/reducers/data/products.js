import * as types from "store/actions/types";

const initState = [];

const products = (state = initState, action) => {
    switch (action.type) {
        case types.FLAVOR_CREATED: {
            const { flavorId, flavorName, productId } = action.payload;
            return state.map(p => p.productId === productId ? { ...p, flavors: [...p.flavors, { flavorId, flavorName, quantity: 0.00 }] } : p);
        } case types.FLAVOR_DELETED: {
            const { flavorId, productId } = action.payload;
            return state.map(p => p.productId === productId ? { ...p, flavors: p.flavors.filter(f => f.flavorId !== flavorId) } : p);
        } case types.FLAVOR_UPDATED: {
            const { flavorId, flavorName, productId } = action.payload;
            return state.map(p => p.productId === productId ? { ...p, flavors: p.flavors.map(f => f.flavorId === flavorId ? { ...f, flavorName } : f) } : p);
        } case types.FLAVOR_QUANTITIES_RECALCULATED: {
            const { productId, flavors } = action.payload;
            return state.map(p => p.productId === productId ? { ...p, flavors } : p);
        } case types.PRODUCT_CREATED: {
            return [...state, action.payload.product];
        } case types.PRODUCT_DELETED: {
            const { id } = action.payload;
            return state.filter(product => product.productId !== id);
        } case types.PRODUCT_UPDATED: {
            const { id, value } = action.payload;
            return state.map(product => product.productId === id ? { ...product, ...value } : product);
        } case types.PRODUCTS_INITIALIZED: {
            return action.payload.products;
        } case types.PRODUCTS_RETRIEVED: {
            const { products } = action.payload;
            return products.length > 0 ? state.concat(products) : state;
        } case types.PRODUCTS_UPDATED: {
            const { products } = action.payload;
            return state.map(product => {
                const updatedProduct = products.find(p => p.productId === product.productId);
                return updatedProduct ? { ...product, ...updatedProduct } : product;
            });
        } case types.PRODUCT_QUANTITY_RECALCULATED: {
            const { productId, quantity } = action.payload;
            return state.map(product => product.productId === productId ? { ...product, quantity } : product);
        } case types.PRODUCT_TOTALS_RECALCULATED: {
            const { productId, quantity, totalRevenue, totalCost, totalProfit } = action.payload;
            return state.map(product => product.productId === productId ? { ...product, quantity, totalRevenue, totalCost, totalProfit } : product);
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default products;