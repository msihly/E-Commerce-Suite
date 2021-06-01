import { toast } from "react-toastify";
import store from "store";
import * as actions from "../";
import * as types from "../types";
import { castObjectNumbers, objectifyFormData, sumArray } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ------------------------------ PLAIN ACTIONS ----------------------------- */
export const flavorCreated = ({ productId, flavorId, flavorName }) => ({
    type: types.FLAVOR_CREATED,
    payload: { productId, flavorId, flavorName }
});

export const flavorDeleted = ({ productId, flavorId }) => ({
    type: types.FLAVOR_DELETED,
    payload: { productId, flavorId }
});

export const flavorUpdated = ({ productId, flavorId, flavorName }) => ({
    type: types.FLAVOR_UPDATED,
    payload: { productId, flavorId, flavorName }
});

export const flavorQuantitiesRecalculated = (productId) => {
    const { inflows, orders } = store.getState();

    const flavors = getProduct(productId).flavors.map(f => {
        const totalInflows = sumArray(inflows.filter(i => i.flavorId === f.flavorId).map(i => i.quantity));
        const totalOutflows = sumArray(orders.flatMap(o => o.lineItems).filter(l => l.flavorId === f.flavorId).map(l => l.quantity));

        return { ...f, quantity: totalInflows - totalOutflows };
    });

    return {
        type: types.FLAVOR_QUANTITIES_RECALCULATED,
        payload: { productId, flavors }
    };
};

export const productCreated = (product) => ({
    type: types.PRODUCT_CREATED,
    payload: { product }
});

export const productDeleted = (id) => ({
    type: types.PRODUCT_DELETED,
    payload: { id }
});

export const productUpdated = (id, value) => ({
    type: types.PRODUCT_UPDATED,
    payload: { id, value }
});

export const productsRetrieved = (products) => ({
    type: types.PRODUCTS_RETRIEVED,
    payload: { products }
});

export const productsUpdated = (products) => ({
    type: types.PRODUCTS_UPDATED,
    payload: { products }
});

export const productQuantityRecalculated = (productId) => ({
    type: types.PRODUCT_QUANTITY_RECALCULATED,
    payload: { productId, quantity: getProductQuantity(productId) }
});

export const productTotalsRecalculated = (productId) => ({
    type: types.PRODUCT_TOTALS_RECALCULATED,
    payload: { productId, ...getProductTotals(productId) }
});

export const productsInitialized = () => ({
    type: types.PRODUCTS_INITIALIZED,
    payload: { products: store.getState().products.map(p => ({ ...p, ...getProductTotals(p.productId, p.unitPrice) })) }
});

/* --------------------------------- THUNKS --------------------------------- */
export const createFlavor = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/product/flavor", { method: "POST", body: formData });

    dispatch(flavorCreated(castObjectNumbers(res.flavor)));

    return res;
}, { hasToast: true, isAuth: true, history });

export const createProduct = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/product", { method: "POST", body: formData });

    const product = { ...castObjectNumbers(res.product), quantity: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0 };
    dispatch(productCreated(product));

    toast.success("Product created");
    return res;
}, { hasToast: true, isAuth: true, history });

export const deleteFlavor = ({ flavorId, productId, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/product/flavor/${flavorId}`, { method: "DELETE" });

    dispatch(flavorDeleted({ flavorId, productId }));

    toast.success(`Flavor #${flavorId} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const deleteProduct = ({ productId, orderIds, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/product/${productId}`, { method: "DELETE" });

    dispatch(productDeleted(productId));

    orderIds.forEach(o => dispatch(actions.orderTotalsRecalculated(o)));

    toast.success(`Product #${productId} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getProducts = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/products", { method: "GET" });

    const products = initializeProducts(res.products);

    dispatch(productsRetrieved(products));

    return { success: true, products };
}, { hasToast: true, isAuth: true, history });

export const updateFlavor = ({ formData, history }) => handleErrors(async (dispatch) => {
    const { flavorId, flavorName, productId } = objectifyFormData(formData);

    await fetchAuthed(`/api/product/flavor/${flavorId}`, { method: "PUT", body: formData });

    dispatch(flavorUpdated({ productId, flavorId, flavorName }));

    toast.success(`Flavor #${flavorId} updated`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const updateProduct = ({ id, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/product/${id}`, { method: "PUT", body: formData });

    const attribute = objectifyFormData(formData);
    dispatch(productUpdated(id, attribute));

    if (Object.keys(attribute)[0] === "unitPrice") dispatch(productTotalsRecalculated(id));

    toast.success(`Product #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });

/* ---------------------------------- UTILS --------------------------------- */
export const getFlavorName = ({ flavorId, product, productId }) => {
    const p = product ?? store.getState().products.find(p => p.productId === productId);
    return p?.flavors.find(f => f.flavorId === flavorId)?.flavorName ?? "None";
};

export const getProduct = (productId) => store.getState().products.find(p => p.productId === productId);

export const getProductRevenue = (productId) => sumArray(store.getState().orders, order => actions.getOrderProductRevenue(order, productId));

export const getProductQuantity = (productId) => {
    const totalInflows = actions.getInflowsTotal(productId);
    const totalSold = sumArray(store.getState().orders, order => actions.getOrderProductQuantity(order, productId));

    return totalInflows - totalSold;
};

export const getProductTotals = (productId, unitPrice) => {
    const quantity = getProductQuantity(productId);
    const totalRevenue = getProductRevenue(productId);
    const totalCost = (unitPrice ?? getProduct(productId)?.unitPrice) * actions.getInflowsTotal(productId);
    const totalProfit = totalRevenue - totalCost;

    return { quantity, totalRevenue, totalCost, totalProfit };
};

export const initializeProducts = (products) => {
    return products.map(p => {
        const product = castObjectNumbers(p, "flavors");
        const totalFlavorsQuantity = sumArray(product.flavors, f => f.quantity);

        if (product.flavors.length > 0 && p.quantity > totalFlavorsQuantity) {
            product.flavors.push({
                productId: p.productId,
                flavorId: null,
                flavorName: "Random",
                quantity: p.quantity - totalFlavorsQuantity
            });
        }

        return product;
    });
};