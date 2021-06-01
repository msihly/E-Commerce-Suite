import { toast } from "react-toastify";
import store from "store";
import * as actions from "../";
import * as types from "../types";
import { castObjectNumbers, objectifyFormData } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";
import { getFlavorName } from "./products";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const inflowCreated = (inflow) => ({
    type: types.INFLOW_CREATED,
    payload: { inflow }
});

export const inflowDeleted = (id) => ({
    type: types.INFLOW_DELETED,
    payload: { id }
});

export const inflowUpdated = (id, value) => ({
    type: types.INFLOW_UPDATED,
    payload: { id, value }
});

export const inflowsRetrieved = (inflows) => ({
    type: types.INFLOWS_RETRIEVED,
    payload: { inflows }
});

export const inflowsInitialized = () => ({
    type: types.INFLOWS_INITIALIZED,
    payload: { inflows: store.getState().inflows.map(i => {
        const product = actions.getProduct(i.productId);
        return {
            ...i,
            flavorName: getFlavorName({ flavorId: i.flavorId, product }),
            productName: product?.productName ?? null
        };
    })}
});

/* -------------------------------- THUNKS ------------------------------- */
export const createInflow = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/inflow", { method: "POST", body: formData });

    const inflow = castObjectNumbers(res.inflow);
    const product = actions.getProduct(inflow.productId);
    inflow.productName = product.productName;
    inflow.flavorName = getFlavorName({ flavorId: inflow.flavorId, product });

    dispatch(inflowCreated(inflow));

    dispatch(actions.productQuantityRecalculated(inflow.productId));
    dispatch(actions.flavorQuantitiesRecalculated(inflow.productId));

    toast.success("Inflow created");
    return { success: true, inflow };
}, { hasToast: true, isAuth: true, history });

export const deleteInflow = ({ inflowId, productIds, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/inflow/${inflowId}`, { method: "DELETE" });

    dispatch(inflowDeleted(inflowId));

    productIds.forEach(p => {
        dispatch(actions.productQuantityRecalculated(p));
        dispatch(actions.flavorQuantitiesRecalculated(p));
    });

    toast.success(`Inflow #${inflowId} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getInflows = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/inflows", { method: "GET" });

    const inflows = res.inflows.map(i => castObjectNumbers(i));
    dispatch(inflowsRetrieved(inflows));

    return { success: true, inflows };
}, { hasToast: true, isAuth: true, history });

export const updateInflow = ({ id, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/inflow/${id}`, { method: "PUT", body: formData });

    const attributes = objectifyFormData(formData);
    const [key, value] = Object.entries(attributes).flat();

    const productId = key === "productId" ? value : getInflow(id).productId;

    if (key === "productId") attributes.productName = actions.getProduct(productId).productName;
    if (key === "flavorId") attributes.flavorName = actions.getFlavorName({ flavorId: value, productId });

    dispatch(inflowUpdated(id, attributes));

    if (key === "quantity") dispatch(actions.productQuantityRecalculated(productId));
    if (["flavorId", "productId", "quantity"].includes(key)) dispatch(actions.flavorQuantitiesRecalculated(productId));

    toast.success(`Inflow #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });

/* -------------------------------- UTILS -------------------------------- */
export const getInflow = (inflowId) => store.getState().inflows.find(i => i.inflowId === inflowId);

export const getInflowsTotal = (productId) => store.getState().inflows.reduce((acc, cur) => acc += cur.productId === productId ? cur.quantity : 0, 0);