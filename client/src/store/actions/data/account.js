import * as actions from "../";
import * as types from "../types";
import { fetchAuthed, handleErrors } from "utils/auth";

/* ---------------------------- PLAIN ACTIONS ---------------------------- */
export const accountRetrieved = (info) => ({
    type: types.ACCOUNT_RETRIEVED,
    payload: { info }
});

export const usernameUpdated = (username) => ({
    type: types.USERNAME_UPDATED,
    payload: { username }
});

/* -------------------------------- THUNKS ------------------------------- */
export const getAccount = (history) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/user/info", { method: "GET" });

    dispatch(accountRetrieved(res.info));

    return res;
}, { isAuth: true, hasToast: true, history });

export const login = (formData, history) => handleErrors(async () => {
    const res = await (await fetch("/api/user/login", { method: "POST", body: formData ?? {} })).json();
    if (!res?.success) throw new Error(res.message);

    localStorage.setItem("accessToken", res.accessToken);

    return res;
}, { isAuth: true, hasToast: true, history });

export const logout = () => handleErrors(async () => {
    const res = await (await fetch("/api/user/logout", { method: "DELETE" })).json();
    if (!res?.success) throw new Error(res.message);

    localStorage.removeItem("accessToken");

    return res;
}, { hasToast: true });

export const refreshToken = () => handleErrors(async () => {
    const res = await (await fetch("/api/user/token", { method: "POST" })).json();
    if (!res?.success) throw new Error(res.message);

    localStorage.setItem("accessToken", res.accessToken);

    return { successs: true };
}, { hasToast: true });

export const register = (formData, history) => handleErrors(async () => {
    const res = await (await fetch("/api/user/register", { method: "POST", body: formData })).json();
    if (!res?.success) throw new Error(res.message);

    localStorage.setItem("accessToken", res.accessToken);

    return res;
}, { isAuth: true, hasToast: true, history });

export const updatePassword = (formData) => handleErrors(async () => {
    await fetchAuthed("/api/user/password", { method: "PUT", body: formData });

    return { success: true };
}, { isAuth: true, hasToast: true });

export const updateUsername = (formData) => handleErrors(async (dispatch) => {
    const res = await fetchAuthed("/api/user/username", { method: "PUT", body: formData });

    dispatch(actions.usernameUpdated(res.username));

    return { success: true };
}, { isAuth: true, hasToast: true });