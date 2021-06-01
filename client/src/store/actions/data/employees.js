import { toast } from "react-toastify";
import store from "store";
import * as types from "../types";
import { objectifyFormData } from "utils";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const employeeCreated = (employee) => ({
    type: types.EMPLOYEE_CREATED,
    payload: { employee }
});

export const employeeDeleted = (id) => ({
    type: types.EMPLOYEE_DELETED,
    payload: { id }
});

export const employeeUpdated = (id, value) => ({
    type: types.EMPLOYEE_UPDATED,
    payload: { id, value }
});

export const employeeNameUpdated = (id, fullName) => ({
    type: types.EMPLOYEE_NAME_UPDATED,
    payload: { id, fullName }
});

export const employeesRetrieved = (employees) => ({
    type: types.EMPLOYEES_RETRIEVED,
    payload: { employees }
});

/* -------------------------------- THUNKS ------------------------------- */
export const createEmployee = ({ formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/employee", { method: "POST", body: formData });

    dispatch(employeeCreated(res.employee));

    toast.success("Employee created");
    return res;
}, { hasToast: true, isAuth: true, history });

export const deleteEmployee = ({ employeeId, history }) => handleErrors(async (dispatch) => {
    await fetchAuthed(`/api/employee/${employeeId}`, { method: "DELETE" });

    dispatch(employeeDeleted(employeeId));

    toast.success(`Employee #${employeeId} deleted`);
    return { success: true };
}, { hasToast: true, isAuth: true, history });

export const getEmployees = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/employees", { method: "GET" });

    dispatch(employeesRetrieved(res.employees));

    return { success: true, employees: res.employees };
}, { hasToast: true, isAuth: true, history });

export const updateEmployee = ({ id, formData, history }) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed(`/api/employee/${id}`, { method: "PUT", body: formData });

    const attribute = objectifyFormData(formData);
    dispatch(employeeUpdated(id, attribute));

    if (["firstName", "lastName"].includes(Object.keys(attribute)[0]))
        dispatch(employeeNameUpdated(id, getEmployeeFullName(id)));

    toast.success(`Employee #${id} updated`);
    return res;
}, { hasToast: true, isAuth: true, history });

/* ---------------------------------- UTILS --------------------------------- */
export const getEmployee = (employeeId) => store.getState().employees.find(e => e.employeeId === employeeId);

export const getEmployeeFullName = (employeeId) => {
    const e = getEmployee(employeeId);
    return e ? `${e.firstName} ${e.lastName ?? ""}`.trim() : null;
};