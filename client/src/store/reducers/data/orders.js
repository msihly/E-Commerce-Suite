import * as types from "store/actions/types";

const initState = [];

const orders = (state = initState, action) => {
    switch (action.type) {
        case types.ORDER_CREATED: {
            return [...state, action.payload.order];
        } case types.ORDER_DELETED: {
            const { id } = action.payload;
            return state.filter(order => order.orderId !== id);
        } case types.ORDER_UPDATED: {
            const { id, value } = action.payload;
            return state.map(order => order.orderId === id ? { ...order, ...value } : order);
        } case types.ORDER_ITEM_CREATED: {
            const { id, orderItem } = action.payload;
            return state.map(order => order.orderId === id ? { ...order, lineItems: [...order.lineItems, { ...orderItem, orderId: id }] } : order);
        } case types.ORDER_ITEM_DELETED: {
            const { id, lineItemNumber } = action.payload;
            return state.map(order => order.orderId === id ? { ...order, lineItems: order.lineItems.filter(line => line.lineItemNumber !== lineItemNumber) } : order);
        } case types.ORDER_ITEM_UPDATED: {
            const { id, lineItemNumber, value } = action.payload;
            return state.map(order => order.orderId === id ? { ...order, lineItems: order.lineItems.map(line =>
                line.lineItemNumber === lineItemNumber ? { ...line, ...value } : line
            ) } : order);
        } case types.ORDERS_RETRIEVED: {
            const { orders } = action.payload;
            return orders.length > 0 ? state.concat(orders) : state;
        } case types.ORDERS_INITIALIZED: {
            return action.payload.orders;
        } case types.ORDER_TOTALS_RECALCULATED: {
            const { orderId, orderTotal, profit } = action.payload;
            return state.map(order => order.orderId === orderId ? { ...order, orderTotal, profit } : order);
        } case types.CUSTOMER_NAME_UPDATED: {
            const { id, fullName } = action.payload;
            return state.map(order => order.customerId === id ? { ...order, customerName: fullName } : order);
        } case types.CUSTOMER_DELETED: {
            const { id } = action.payload;
            return state.filter(order => order.customerId !== id);
        } case types.EMPLOYEE_NAME_UPDATED: {
            const { id, fullName } = action.payload;
            return state.map(order => order.employeeId === id ? { ...order, employeeName: fullName } : order);
        } case types.EMPLOYEE_DELETED: {
            const { id } = action.payload;
            return state.filter(order => order.employeeId !== id);
        } case types.PRODUCT_DELETED: {
            const { id } = action.payload;
            return state.map(order => ({ ...order, lineItems: order.lineItems.filter(line => line.productId !== id) }));
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default orders;