import * as types from "store/actions/types";

const initState = [];

const customers = (state = initState, action) => {
    switch (action.type) {
        case types.CUSTOMER_CREATED: {
            return [...state, action.payload.customer];
        } case types.CUSTOMER_DELETED: {
            const { id } = action.payload;
            return state.filter(customer => customer.customerId !== id);
        } case types.CUSTOMER_UPDATED: {
            const { id, value } = action.payload;
            return state.map(customer => customer.customerId === id ? { ...customer, ...value } : customer);
        } case types.CUSTOMERS_RETRIEVED: {
            const { customers } = action.payload;
            return customers.length > 0 ? state.concat(customers) : state;
        } case types.CUSTOMERS_INITIALIZED: {
            return action.payload.customers;
        } case types.CUSTOMER_NAME_UPDATED: {
            const { id, fullName } = action.payload;
            return state.map(customer => customer.referrerId === id ? { ...customer, referrerName: fullName } : customer);
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default customers;