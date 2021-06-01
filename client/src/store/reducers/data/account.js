import * as types from "store/actions/types";

const initState = {};

const account = (state = initState, action) => {
    switch (action.type) {
        case types.ACCOUNT_RETRIEVED: {
            const { info } = action.payload;
            return { ...state, ...info };
        } case types.USERNAME_UPDATED: {
            const { username } = action.payload;
            return { ...state, username };
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default account;