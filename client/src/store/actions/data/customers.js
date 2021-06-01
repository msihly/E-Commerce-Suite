import { toast } from "react-toastify";
import store from "store";
import * as actions from "../";
import * as types from "../types";
import { emptyStringsToNull, objectifyFormData } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const customerCreated = (customer) => ({
    type: types.CUSTOMER_CREATED,
    payload: { customer }
});

export const customerDeleted = (id) => ({
    type: types.CUSTOMER_DELETED,
    payload: { id }
});

export const customerUpdated = (id, value) => {
    const [k, v] = Object.entries(value).flat();
    if (k === "referrerId") value.referrerName = v ? actions.getCustomerFullName(v) : "None";

    return {
        type: types.CUSTOMER_UPDATED,
        payload: { id, value }
    };
};

export const customersRetrieved = (customers) => ({
    type: types.CUSTOMERS_RETRIEVED,
    payload: { customers }
});

export const customerNameUpdated = (id, fullName) => ({
    type: types.CUSTOMER_NAME_UPDATED,
    payload: { id, fullName }
});

export const customersInitialized = () => ({
    type: types.CUSTOMERS_INITIALIZED,
    payload: { customers: store.getState().customers.map(c => ({ ...c, referrerId: c.referrerId ?? null, referrerName: c.referrerId ? getCustomerFullName(c.referrerId) : "None" })) }
});

/* -------------------------------- THUNKS ------------------------------- */
export const createCustomer = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/customer", { method: "POST", body: formData });

    const customer = emptyStringsToNull(res.customer);
    customer.referrerName = customer.referrerId ? getCustomerFullName(customer.referrerId) : "None";
    dispatch(customerCreated(customer));

    toast.success("Customer created");
    return res;
}, { hasToast: true, isAuth: true, history });

export const createInvitation = ({ customerId, history }) => handleErrors(async () => {
    return await fetchAuthed(`/api/customer/${customerId}/invite`, { method: "POST" });
}, { hasToast: true, isAuth: true, history });

export const deleteCustomer = ({ customerId, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/customer/${customerId}`, { method: "DELETE" });

    dispatch(customerDeleted(customerId));

    toast.success(`Customer #${customerId} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getCustomers = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/customers", { method: "GET" });

    dispatch(customersRetrieved(res.customers));

    return { success: true, customers: res.customers };
}, { hasToast: true, isAuth: true, history });

export const updateCustomer = ({ id, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/customer/${id}`, { method: "PUT", body: formData });

    const attribute = objectifyFormData(formData);
    dispatch(customerUpdated(id, attribute));

    if (["firstName", "lastName"].includes(Object.keys(attribute)[0]))
        dispatch(customerNameUpdated(id, getCustomerFullName(id)));

    toast.success(`Customer #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });

/* ---------------------------------- UTILS --------------------------------- */
export const getCustomer = (customerId) => store.getState().customers.find(c => c.customerId === customerId);

export const getCustomerFullName = (customerId) => {
    const c = getCustomer(customerId);
    return c ? `${c.firstName} ${c.lastName ?? ""}`.trim() : null;
};