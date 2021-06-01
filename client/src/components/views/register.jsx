import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Form, Input } from "components/form";

const Register = () => {
    const history = useHistory();
    const { token } = useParams();

    const dispatch = useDispatch();

    const handleRegisterSubmit = async (formData) => {
        formData.append("token", token);

        const res = await dispatch(actions.register(formData, history));
        if (res?.success) {
            toast.success("Welcome to The Demo");
            history.push("/");
        }
    };

    useEffect(() => document.title = "Register - Demo", []);

    return (
        <main className="common login lg-bg">
            <div className="login-wrapper pad-ctn-2">
                <h1>REGISTER</h1>
                <Form idPrefix="register" onSubmit={handleRegisterSubmit} classes="login-form center"
                    submitText="Register" submitClasses="blue-2-bg">
                    <Input id="username" type="text" name="username" placeholder="Username"
                        autoComplete="username" hasErrorCheck isRequired />
                    <Input id="password" type="password" name="password" placeholder="Password"
                        autoComplete="current-password" hasErrorCheck isRequired />
                    <Input id="password-conf" type="password" name="passwordConf" placeholder="Confirm Password"
                        autoComplete="confirm-password" hasErrorCheck isRequired />
                </Form>
            </div>
        </main>
    );
};

export default Register;