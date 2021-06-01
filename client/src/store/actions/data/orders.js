import { toast } from "react-toastify";
import store from "store";
import * as actions from "../";
import * as types from "../types";
import { castObjectNumbers, getLocalDateTime, objectifyFormData, sumArray } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const orderCreated = (order) => ({
    type: types.ORDER_CREATED,
    payload: { order }
});

export const orderDeleted = (id) => ({
    type: types.ORDER_DELETED,
    payload: { id }
});

export const orderUpdated = (id, value) => {
    const [k, v] = Object.entries(value).flat();
    if (k === "customerId") value.customerName = actions.getCustomerFullName(v);
    if (k === "employeeId") value.employeeName = actions.getEmployeeFullName(v);

    return {
        type: types.ORDER_UPDATED,
        payload: { id, value }
    };
};

export const orderItemDeleted = (id, lineItemNumber) => ({
    type: types.ORDER_ITEM_DELETED,
    payload: { id, lineItemNumber }
});

export const orderItemCreated = (id, orderItem) => ({
    type: types.ORDER_ITEM_CREATED,
    payload: { id, orderItem }
});

export const orderItemUpdated = (id, lineItemNumber, value) => ({
    type: types.ORDER_ITEM_UPDATED,
    payload: { id, lineItemNumber, value }
});

export const ordersRetrieved = (orders) => ({
    type: types.ORDERS_RETRIEVED,
    payload: { orders }
});

export const orderTotalsRecalculated = (orderId) => ({
    type: types.ORDER_TOTALS_RECALCULATED,
    payload: {
        orderId,
        orderTotal: getOrderRevenue(getOrder(orderId)),
        profit: getOrderProfit(getOrder(orderId))
    }
});

export const ordersInitialized = () => ({
    type: types.ORDERS_INITIALIZED,
    payload: { orders: store.getState().orders.map(o => initializeOrder(o)) }
});

/* -------------------------------- THUNKS ------------------------------- */
export const createOrder = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/order", { method: "POST", body: formData });

    const order = initializeOrder(castObjectNumbers(res.order));
    dispatch(orderCreated(order));

    order.lineItems.forEach(line => {
        dispatch(actions.productTotalsRecalculated(line.productId));
        dispatch(actions.flavorQuantitiesRecalculated(line.productId));
    });

    toast.success(`Order #${order.orderId} created`);
    return { success: true, order };
}, { hasToast: true, isAuth: true, history });

export const createOrderItem = ({ id, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/order/${id}`, { method: "POST", body: formData });

    const orderItem = objectifyFormData(formData);
    orderItem.flavorName = actions.getFlavorName(orderItem);

    dispatch(orderItemCreated(id, orderItem));

    dispatch(orderTotalsRecalculated(id));
    dispatch(actions.productTotalsRecalculated(orderItem.productId));
    dispatch(actions.flavorQuantitiesRecalculated(orderItem.productId));

    toast.success(`Order #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });

export const deleteOrder = ({ orderId, productIds, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/order/${orderId}`, { method: "DELETE" });

    dispatch(orderDeleted(orderId));

    productIds.forEach(p => dispatch(actions.productTotalsRecalculated(p)));

    toast.success(`Order #${orderId} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const deleteOrderItem = ({ orderId, lineItemNumber, productId, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/order/${orderId}/${lineItemNumber}`, { method: "DELETE" });

    dispatch(orderItemDeleted(orderId, lineItemNumber));

    dispatch(orderTotalsRecalculated(orderId));
    dispatch(actions.productTotalsRecalculated(productId));
    dispatch(actions.flavorQuantitiesRecalculated(productId));

    toast.success(`Order #${orderId} - Line #${lineItemNumber} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getOrders = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/orders", { method: "GET" });

    const orders = res.orders.map(o => ({ ...castObjectNumbers(o, "lineItems"), orderDate: getLocalDateTime(o.orderDate) }));
    dispatch(ordersRetrieved(orders));

    return { success: true, orders };
}, { hasToast: true, isAuth: true, history });

export const updateOrder = ({ id, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/order/${id}`, { method: "PUT", body: formData });

    const attribute = objectifyFormData(formData);
    dispatch(orderUpdated(id, attribute));

    toast.success(`Order #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });

export const updateOrderItem = ({ id, subId, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/order/${id}/${subId}`, { method: "PUT", body: formData });

    const attributes = objectifyFormData(formData);
    const [key, value] = Object.entries(attributes).flat();

    const productId = key === "productId" ? value : getOrderItem(id, subId).productId;

    if (key === "productId") attributes.productName = actions.getProduct(productId).productName;
    if (key === "flavorId") attributes.flavorName = actions.getFlavorName({ flavorId: value, productId });

    dispatch(orderItemUpdated(id, subId, attributes));

    if (["quantity", "pricePaid"].includes(key)) dispatch(orderTotalsRecalculated(id));
    if (["quantity", "productId", "pricePaid"].includes(key)) dispatch(actions.productTotalsRecalculated(productId));
    if (["flavorId", "quantity", "productId"].includes(key)) dispatch(actions.flavorQuantitiesRecalculated(productId));

    toast.success(`Order #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });

/* -------------------------------- UTILS -------------------------------- */
export const getOrder = (orderId) => store.getState().orders.find(o => o.orderId === orderId);

export const getOrderItem = (orderId, lineItemNumber) => getOrder(orderId).lineItems.find(line => line.lineItemNumber === lineItemNumber);

export const getOrderRevenue = (order) => sumArray(order.lineItems, line => line.pricePaid);

export const getOrderProfit = (order) => sumArray(order.lineItems, line => line.pricePaid - (line.quantity * actions.getProduct(line.productId)?.unitPrice));

export const getOrderProductQuantity = (order, productId) => sumArray(order.lineItems, line => line.productId === productId ? line.quantity : 0);

export const getOrderProductCost = (order, productId, unitPrice) => sumArray(order.lineItems, line => line.productId === productId ? line.quantity * (unitPrice ?? actions.getProduct(productId)?.unitPrice) : 0);

export const getOrderProductRevenue = (order, productId) => sumArray(order.lineItems, line => line.productId === productId ? line.pricePaid : 0);

export const getOrderProductProfit = (order, productId, unitPrice) => sumArray(order.lineItems, line => line.productId === productId ? line.pricePaid - (line.quantity * (unitPrice ?? actions.getProduct(productId)?.unitPrice)) : 0);

export const initializeOrder = (order) => ({
    ...order,
    customerName: actions.getCustomerFullName(order.customerId),
    employeeName: order.employeeId ? actions.getEmployeeFullName(order.employeeId) : null,
    orderTotal: getOrderRevenue(order),
    profit: getOrderProfit(order),
    lineItems: order.lineItems.map(line => ({ ...line, flavorName: actions.getFlavorName(line) }))
});