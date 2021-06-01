import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Form, Input } from "components/form";

const Account = () => {
    const history = useHistory();
    const location = useLocation();

    const dispatch = useDispatch();

    const account = useSelector(state => state.account);

    const logout = async () => {
        const res = await dispatch(actions.logout());
        if (res?.success) {
            toast.success("Logout successful");
            history.push("/login");
        }
    };

    const updateUsername = async (formData) => {
        const res = await dispatch(actions.updateUsername(formData));
        if (res?.success) toast.success("Username updated");
    };

    const updatePassword = async (formData) => {
        const res = await dispatch(actions.updatePassword(formData));
        if (res?.success) toast.success("Password updated");
    };

    return (
        <div className="account">
            <div className="section">
                <h3 className="glow">Update Username</h3>
                <Form submitText="Submit" classes="center" labelClasses="small"
                    onSubmit={updateUsername}>
                    <Input id="username" name="username" label="Username" initValue={account?.username} hasErrorCheck isRequired />
                    <Input id="password" name="password" label="Confirm Password" hasErrorCheck isRequired />
                </Form>
            </div>

            <div className="section">
                <h3 className="glow">Update Password</h3>
                <Form idPrefix="password" submitText="Submit" classes="center" labelClasses="small"
                    onSubmit={updatePassword}>
                    <Input id="current" name="currentPassword" label="Current Password"
                        type="password" autoComplete="current-password" hasErrorCheck isRequired />
                    <Input id="new" name="newPassword" label="New Password"
                        type="password" autoComplete="new-password" hasErrorCheck isRequired />
                    <Input id="confirm" name="passwordConf" label="Confirm Password"
                        type="password" autoComplete="new-password" hasErrorCheck isRequired />
                </Form>
            </div>

            {location.pathname === "/dashboard" ?
                <button onClick={() => history.push("/")}>Menu</button>
                : account?.accessLevel ?
                    <button onClick={() => history.push("/dashboard")}>Dashboards</button>
                    : null
            }

            <button className="red-1-bg" onClick={logout}>Logout</button>
        </div>
    );
};

export default Account;