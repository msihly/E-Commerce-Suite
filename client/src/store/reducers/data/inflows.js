import * as types from "store/actions/types";

const initState = [];

const inflows = (state = initState, action) => {
    switch (action.type) {
        case types.INFLOW_CREATED: {
            return [...state, action.payload.inflow];
        } case types.INFLOW_DELETED: {
            const { id } = action.payload;
            return state.filter(inflow => inflow.inflowId !== id);
        } case types.INFLOW_UPDATED: {
            const { id, value } = action.payload;
            return state.map(inflow => inflow.inflowId === id ? { ...inflow, ...value } : inflow);
        } case types.INFLOWS_RETRIEVED: {
            const { inflows } = action.payload;
            return inflows.length > 0 ? state.concat(inflows) : state;
        } case types.INFLOWS_INITIALIZED: {
            return action.payload.inflows;
        } case types.PRODUCT_DELETED: {
            const { id } = action.payload;
            return state.filter(inflow => inflow.productId !== id);
        } case types.PRODUCT_UPDATED: {
            const { id, value } = action.payload;
            if (Object.keys(value)[0] !== "productName") return state;
            return state.map(inflow => inflow.productId === id ? { ...inflow, ...value } : inflow);
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default inflows;