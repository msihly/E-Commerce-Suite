import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { Tab, Tabs } from "components/tabs";
import { Account, Loading } from "components/views/_common";
import { Customers, Employees, Expenses, Inflows, Listings, Orders, Products, Reports } from "./";

const Home = ({ history }) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Home - Demo";

        const fetchAllData = async () => {
            const res = await dispatch(actions.getAccount(history));
            if (!res?.success) return history.push("/login");
            if (res.info?.accessLevel !== 1) return history.push("/");

            await Promise.all([
                dispatch(actions.getCustomers(history)),
                dispatch(actions.getEmployees(history)),
                dispatch(actions.getExpenses(history)),
                dispatch(actions.getInflows(history)),
                dispatch(actions.getListings(history)),
                dispatch(actions.getOrders(history)),
                dispatch(actions.getProducts(history)),
            ]);

            dispatch(actions.customersInitialized());
            dispatch(actions.expensesInitialized());
            dispatch(actions.inflowsInitialized());
            dispatch(actions.ordersInitialized());
            dispatch(actions.productsInitialized());

            setIsLoading(false);
        };

        fetchAllData();

        localStorage.setItem("showUnconfirmedOrders", "true");

        return () => dispatch(actions.stateReset());
    }, [dispatch]); //eslint-disable-line

    return isLoading ? <Loading /> : (
        <div className="common home">
            <Tabs tabClasses="center dashboard" hasScrollPlaceholder isChips>
                <Tab label="Listings" className="listings-preview">
                    <Listings />
                </Tab>

                <Tab label="Orders" className="max-w-1100">
                    <Orders />
                </Tab>

                <Tab label="Customers">
                    <Customers />
                </Tab>

                <Tab label="Products">
                    <Products />
                </Tab>

                <Tab label="Inflows" className="max-w-1200">
                    <Inflows />
                </Tab>

                <Tab label="Expenses">
                    <Expenses />
                </Tab>

                <Tab label="Employees" className="max-w-800">
                    <Employees />
                </Tab>

                <Tab label="Reports" className="max-w-800 no-menu">
                    <Reports />
                </Tab>

                <Tab label="Account" className="no-menu j-center">
                    <Account />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Home;