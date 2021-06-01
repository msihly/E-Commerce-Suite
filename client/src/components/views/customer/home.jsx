import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { NavBar, NavButton } from "components/navbar";
import { Account, Loading } from "components/views/_common";
import { Cart, Catalog, OrderHistory } from "./";
import * as Media from "media";

const Home = ({ history }) => {
    const dispatch = useDispatch();

    const [activeView, setActiveView] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const renderView = () => [<Catalog />, <Cart />, <OrderHistory />, <Account />][activeView];

    useEffect(() => {
        const fetchAllData = async () => {
            const res = await dispatch(actions.getAccount(history));
            if (!res?.success) return history.push("/login");

            await Promise.all([
                dispatch(actions.getListings(history)),
                dispatch(actions.getCart(history)),
                dispatch(actions.getOrders(history)),
                dispatch(actions.getProducts(history)),
            ]);

            setIsLoading(false);
        };

        fetchAllData();

        return () => dispatch(actions.stateReset());
    }, [dispatch]); //eslint-disable-line

    useEffect(() => {
        const viewName = ["Menu", "Cart", "Orders", "Account"];
        document.title = `${viewName[activeView]} - Demo`;
    }, [activeView]);

    return isLoading ? <Loading /> : (
        <div className="common sale-menu">
            <header className="logo-bar">
                <img src={Media.Logo} alt="The Demo" />
            </header>

            <main>{renderView()}</main>

            <NavBar position="bottom" switchView={setActiveView} activeView={activeView}>
                <NavButton text="Menu" icon={<Media.GridSVG style={{ padding: "0.1em" }} />} />
                <NavButton text="Cart" icon={<Media.ShoppingCartSVG />} />
                <NavButton text="Orders" icon={<Media.ListSVG />} />
                <NavButton text="Account" icon={<Media.UserCircleSVG />} />
            </NavBar>
        </div>
    );
};

export default Home;