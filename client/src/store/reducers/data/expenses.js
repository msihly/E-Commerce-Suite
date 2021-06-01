import * as types from "store/actions/types";

const initState = [];

const expenses = (state = initState, action) => {
    switch (action.type) {
        case types.EXPENSE_CREATED: {
            return [...state, action.payload.expense];
        } case types.EXPENSE_DELETED: {
            const { id } = action.payload;
            return state.filter(expense => expense.expenseId !== id);
        } case types.EXPENSE_UPDATED: {
            const { id, value } = action.payload;
            return state.map(expense => expense.expenseId === id ? { ...expense, ...value } : expense);
        } case types.EXPENSES_RETRIEVED: {
            const { expenses } = action.payload;
            return expenses.length > 0 ? state.concat(expenses) : state;
        } case types.EXPENSES_INITIALIZED: {
            return action.payload.expenses;
        } case types.EMPLOYEE_NAME_UPDATED: {
            const { id, fullName } = action.payload;
            return state.map(expense => expense.payeeId === id ? { ...expense, payeeName: fullName } : expense);
        } case types.EMPLOYEE_DELETED: {
            const { id } = action.payload;
            return state.map(expense => expense.payeeId === id ? { ...expense, payeeId: null, payeeName: "None" } : expense);
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default expenses;