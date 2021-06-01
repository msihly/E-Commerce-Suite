import { toast } from "react-toastify";
import store from "store";
import * as actions from "../";
import * as types from "../types";
import { castObjectNumbers, objectifyFormData } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const expenseCreated = (expense) => ({
    type: types.EXPENSE_CREATED,
    payload: { expense }
});

export const expenseDeleted = (id) => ({
    type: types.EXPENSE_DELETED,
    payload: { id }
});

export const expenseUpdated = (id, value) => {
    const [k, v] = Object.entries(value).flat();
    if (k === "payeeId") value.payeeName = v ? actions.getEmployeeFullName(v) : "None";

    return {
        type: types.EXPENSE_UPDATED,
        payload: { id, value }
    };
};

export const expensesRetrieved = (expenses) => ({
    type: types.EXPENSES_RETRIEVED,
    payload: { expenses }
});

export const expensesInitialized = () => ({
    type: types.EXPENSES_INITIALIZED,
    payload: { expenses: store.getState().expenses.map(e => ({ ...e, payeeId: e.payeeId ?? null, payeeName: e.payeeId ? actions.getEmployeeFullName(e.payeeId) : "None" })) }
});

/* -------------------------------- THUNKS ------------------------------- */
export const createExpense = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/expense", { method: "POST", body: formData });

    const expense = castObjectNumbers(res.expense);
    dispatch(expenseCreated(expense));

    toast.success("Expense created");
    return { success: true, expense };
}, { hasToast: true, isAuth: true, history });

export const deleteExpense = ({ expenseId, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/expense/${expenseId}`, { method: "DELETE" });

    dispatch(expenseDeleted(expenseId));

    toast.success(`Expense #${expenseId} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getExpenses = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/expenses", { method: "GET" });

    const expenses = res.expenses.map(e => castObjectNumbers(e));
    dispatch(expensesRetrieved(expenses));

    return { sucess: true, expenses };
}, { hasToast: true, isAuth: true, history });

export const updateExpense = ({ id, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/expense/${id}`, { method: "PUT", body: formData });

    dispatch(expenseUpdated(id, objectifyFormData(formData)));

    toast.success(`Expense #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });