import * as types from "store/actions/types";

const inputs = (state = [], action) => {
    switch (action.type) {
        case types.IMAGE_INPUT_CREATED: {
            const { id, value } = action.payload;
            return [...state, { id, value, isImageRemoved: false }];
        } case types.IMAGE_INPUT_UPDATED: {
            const { id, value, isImageRemoved } = action.payload;
            return state.map(input => input.id === id ? {...input, value, isImageRemoved } : input);
        } case types.INPUT_CREATED: {
            const { id, value } = action.payload;
            return [...state, { id, value }];
        } case types.INPUT_UPDATED: {
            const { id, value } = action.payload;
            return state.map(input => input.id === id ? { ...input, value } : input);
        } case types.INPUT_DELETED: {
            return state.filter(input => input.id !== action.payload.id);
        } default: {
            return state;
        }
    }
};

export default inputs;