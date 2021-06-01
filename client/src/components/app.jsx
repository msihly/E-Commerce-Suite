import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { AuthRoute, NotFound } from "components/views/_common";
import { AdminHome, CustomerHome, Login, Register } from "components/views";
import "react-toastify/dist/ReactToastify.css";
import "css/index.scss";

toast.configure({
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: 0,
    toastClassName: "Toastify__toast--dark"
});

const App = () => {
    const dispatch = useDispatch();


    useEffect(() => {
        const closeMenus = () => dispatch(actions.externalClick());

        window.addEventListener("click", closeMenus);

        return () => window.removeEventListener("click", closeMenus);
    }, [dispatch]);

    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/invite/:token" component={Register} />
                <AuthRoute exact path="/" component={CustomerHome} />
                <AuthRoute exact path="/dashboard" component={AdminHome} />
                <Route path="*" component={NotFound}/>
            </Switch>
        </BrowserRouter>
    );
}

export default App;