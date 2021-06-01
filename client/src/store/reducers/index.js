import { combineReducers } from "redux";
import { inputs, menus, modals, observers, panels } from "./components";
import { account, cart, customers, employees, expenses, inflows, listings, orders, products } from "./data";

const rootReducer = combineReducers({
    account,
    cart,
    customers,
    employees,
    expenses,
    inflows,
    listings,
    inputs,
    menus,
    modals,
    observers,
    orders,
    panels,
    products
});

export default rootReducer;