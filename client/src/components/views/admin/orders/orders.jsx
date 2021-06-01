import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { DataColumn, DataTable } from "components/dataTable";
import { FloatingMenu, CircleButton } from "components/popovers";
import { checkConditions, CURRENT_DATE, PERIOD_START } from "../common";
import { DeleteOrderAlert, DeleteOrderItemAlert, FilterModal, OrderCreator, OrderItemCreator, UnconfirmedOrders,
        DELETE_ORDER_ALERT_ID, DELETE_ORDER_ITEM_ALERT_ID, FILTER_MODAL_ID, ORDER_MODAL_ID, ORDER_ITEM_MODAL_ID, UNCONFIRMED_MODAL_ID } from "./";
import { dateInRange } from "utils";
import * as Media from "media";

const Orders = () => {
    const dispatch = useDispatch();

    const customers = useSelector(state => state.customers);
    const employees = useSelector(state => state.employees);
    const orders = useSelector(state => state.orders);
    const products = useSelector(state => state.products);

    const modals = useSelector(state => state.modals);
    const [isOrderCreatorOpen, isOrderItemCreatorOpen, isUnconfirmedOpen, isDeleteOrderAlertOpen, isDeleteOrderItemAlertOpen, isFilterOpen] =
        [ORDER_MODAL_ID, ORDER_ITEM_MODAL_ID, UNCONFIRMED_MODAL_ID, DELETE_ORDER_ALERT_ID, DELETE_ORDER_ITEM_ALERT_ID, FILTER_MODAL_ID]
        .map(id => modals.find(m => m.id === id)?.isOpen ?? false);

    const [activeOrder, setActiveOrder] = useState(orders[0]?.orderId);

    const activeOrderItems = orders && orders.find(o => o.orderId === activeOrder)?.lineItems.map(line => {
        const { productName = "", unitPrice } = products.find(p => p.productId === line.productId) ?? {};
        return { ...line, productName, cost: line.quantity * unitPrice, profit: line.pricePaid - (line.quantity * unitPrice) };
    });

    useEffect(() => {
        if (localStorage.getItem("showUnconfirmedOrders") === "true" && orders.filter(o => o.employeeId === null).length > 0) {
            dispatch(actions.modalOpened(UNCONFIRMED_MODAL_ID));
            localStorage.setItem("showUnconfirmedOrders", "false");
        }
    }, [dispatch, orders]);

    // BEGIN - Order / Order Item Deletion
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const handleDeleteOrder = (orderId) => {
        setDeleteId(orderId);
        dispatch(actions.modalOpened(DELETE_ORDER_ALERT_ID));
    };

    const handleDeleteOrderItem = (orderItemId) => {
        setDeleteId(orderItemId);
        dispatch(actions.modalOpened(DELETE_ORDER_ITEM_ALERT_ID));
    };
    // END - Order / Order Item Deletion

    // BEGIN - Filtering
    const customerSet = useMemo(() => [...new Set(orders.map(o => o.customerId))].map(id => ({ displayed: orders.find(o => o.customerId === id)?.customerName, form: id })), [orders]);
    const employeeSet = useMemo(() => [...new Set(orders.map(o => o.employeeId))].map(id => ({ displayed: orders.find(o => o.employeeId === id)?.employeeName, form: id })), [orders]);
    const productSet = useMemo(() => products.map(p => ({ displayed: p.productName, form: p.productId })), [products]);

    const defaultFilters = {
        startDate: PERIOD_START,
        endDate: CURRENT_DATE,
        customers: customerSet,
        employees: employeeSet,
        products: productSet,
        conditions: []
    };

    const [isFiltered, setIsFiltered] = useState(false);
    const [filters, setFilters] = useState({ ...defaultFilters });

    const displayedOrders = useMemo(() => (
        isFiltered ? orders.filter(o => {
            if (!dateInRange(o.orderDate, filters.startDate, filters.endDate)) return false;
            if (!filters.customers.find(c => c.form === o.customerId)) return false;
            if (!filters.employees.find(e => e.form === o.employeeId)) return false;
            if (o.lineItems.map(l => filters.products.find(p => p.form === l.productId)).includes(undefined)) return false;
            if (!checkConditions(filters.conditions, o)) return false;
            return true;
        }) : orders
    ), [filters, isFiltered, orders]);

    useEffect(() => {
        const [source, displayed] = [orders.length, displayedOrders.length];
        if (displayed !== source) toast.info(`${source - displayed} orders filtered`);
        if (!displayedOrders.find(o => o.orderId === activeOrder)) setActiveOrder(displayedOrders[0]?.orderId);
    }, [displayedOrders, orders]); //eslint-disable-line
    // END - Filtering

    return (
        <Fragment>
            {isUnconfirmedOpen && <UnconfirmedOrders />}

            <DataTable defaultSrc={displayedOrders} idAttr="orderId" updateFunc={actions.updateOrder} activeRow={activeOrder} handleDelete={handleDeleteOrder}
                isDeleteMode={isDeleteMode} numericalFields={["orderId", "orderTotal", "profit"]} classes="full-width" outerClasses="main-table">
                <DataColumn columnName="ID" srcAttr="orderId" type="number" classes="clickable" onClick={({ value }) => setActiveOrder(value)} />
                <DataColumn columnName="Customer" srcAttr="customerName" name="customerId" type="text" isEditable isSelect
                    src={customers} optionsFormula={c => `${c.customerId}: ${c.firstName} ${c.lastName ?? ""}`.trim()} />
                <DataColumn columnName="Order Total" srcAttr="orderTotal" type="currency" />
                <DataColumn columnName="Profit" srcAttr="profit" type="currency" hasColorScale />
                <DataColumn columnName="Date" srcAttr="orderDate" type="date" isEditable />
                <DataColumn columnName="Employee" srcAttr="employeeName" name="employeeId" type="text" isEditable isSelect
                    src={employees} optionsFormula={e => `${e.employeeId}: ${e.firstName} ${e.lastName ?? ""}`.trim()} />
            </DataTable>

            <DataTable defaultSrc={activeOrderItems} idAttr="orderId" subIdAttr="lineItemNumber" updateFunc={actions.updateOrderItem}
                handleDelete={handleDeleteOrderItem} isDeleteMode={isDeleteMode} classes="full-width" outerClasses="sub-table"
                numericalFields={["cost", "lineItemNumber", "orderId", "pricePaid", "profit", "quantity"]}>
                <DataColumn columnName="Line" srcAttr="lineItemNumber" type="number" />
                <DataColumn columnName="Product" srcAttr="productName" name="productId" type="text" isEditable isSelect
                    src={products} optionsFormula={p => `${p.productId}: ${p.productName}`} />
                <DataColumn columnName="Flavor" srcAttr="flavorName" name="flavorId" type="text" isEditable isSelect
                    src={row => products.find(p => p.productId === row.productId)?.flavors} optionsFormula={f => f.flavorName} />
                <DataColumn columnName="Quantity" srcAttr="quantity" type="number" isEditable />
                <DataColumn columnName="Price Paid" srcAttr="pricePaid" type="currency" isEditable />
                <DataColumn columnName="Cost" srcAttr="cost" type="currency" />
                <DataColumn columnName="Profit" srcAttr="profit" type="currency" hasColorScale />
            </DataTable>

            <FloatingMenu position="bottom" isHorizontal>
                <CircleButton title="Create Order" onClick={() => dispatch(actions.modalOpened(ORDER_MODAL_ID))}>
                    <Media.PlusSVG />
                    {isOrderCreatorOpen && <OrderCreator />}
                </CircleButton>

                <CircleButton title="Add Order Item" onClick={() => dispatch(actions.modalOpened(ORDER_ITEM_MODAL_ID))}>
                    <Media.AppendSVG />
                    {isOrderItemCreatorOpen && <OrderItemCreator {...{ activeOrder }} />}
                </CircleButton>

                <CircleButton title="Open Unconfirmed Orders" onClick={() => dispatch(actions.modalOpened(UNCONFIRMED_MODAL_ID))}>
                    <Media.CheckmarkSVG />
                </CircleButton>

                <CircleButton title="Filter Products" onClick={() => dispatch(actions.modalOpened(FILTER_MODAL_ID))} isActive={isFiltered}>
                    <Media.FilterSVG />
                    {isFilterOpen && <FilterModal {...{ defaultFilters, filters, setFilters, setIsFiltered }} />}
                </CircleButton>

                <CircleButton title={`${isDeleteMode ? "Disable" : "Enable"} Delete Mode`} classes="red"
                    onClick={() => setIsDeleteMode(!isDeleteMode)} isActive={isDeleteMode}>
                    <Media.TrashcanSVG />
                    {isDeleteOrderAlertOpen && <DeleteOrderAlert id={DELETE_ORDER_ALERT_ID} orderId={deleteId} />}
                    {isDeleteOrderItemAlertOpen && <DeleteOrderItemAlert id={DELETE_ORDER_ITEM_ALERT_ID} orderId={activeOrder} lineItemNumber={deleteId} />}
                </CircleButton>
            </FloatingMenu>
        </Fragment>
    );
};

export default Orders;