import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Loading } from "components/views/_common";
import { Form, Input, Checkbox } from "components/form";
import { login } from "utils/auth";

const Login = () => {
    const history = useHistory();

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(true);

    const handleLoginSubmit = async (formData) => {
        const res = await dispatch(actions.login(formData, history));
        if (res?.success) {
            toast.success("Login successful");
            history.push("/");
        }
    };

    useEffect(() => {
        document.title = "Login - Demo";

        const authenticate = async (token) => {
            if (token) {
                const isAuthed = await login({ accessToken: token });
                if (isAuthed) return history.push("/dashboard");
            }

            setIsLoading(false);
        };

        const accessToken = localStorage.getItem("accessToken");

        authenticate(accessToken);
    }, []); //eslint-disable-line

    return isLoading ? <Loading /> : (
        <main className="common login lg-bg">
            <div className="login-wrapper pad-ctn-2">
                <h1>LOGIN</h1>
                <Form idPrefix="login" classes="login-form center" onSubmit={handleLoginSubmit} submitText="Sign In">
                    <Input id="username" type="text" name="username" placeholder="Username"
                        autoComplete="username" isRequired />
                    <Input id="password" type="password" name="password" placeholder="Password"
                        autoComplete="current-password" isRequired />
                    <Checkbox id="remember-me" text="Keep me logged in" inputName="hasRememberMe" initValue={false} />
                </Form>
            </div>
        </main>
    );
};

export default Login;