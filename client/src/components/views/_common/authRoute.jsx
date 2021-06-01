import React, { useEffect, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Loading } from "components/views/_common";
import { login } from "utils/auth";

const AuthRoute = ({ component: Component, ...rest }) => {
    const history = useHistory();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return history.push("/login");

        const authenticate = async () => {
            const isAuthed = await login({ accessToken });
            return isAuthed ? setIsLoading(false) : history.push("/login");
        };

        authenticate();
    }, []); //eslint-disable-line

    return <Route {...rest} render={props => isLoading ? <Loading /> : <Component {...props} />} />;
};

export default AuthRoute;