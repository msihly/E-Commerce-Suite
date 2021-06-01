import React, { useState } from "react";
import { useSelector } from "react-redux";
import * as actions from "store/actions";
import { Modal } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { UNCONFIRMED_MODAL_ID } from "./";

const UnconfirmedOrders = () => {
    const orders = useSelector(state => state.orders);
    const products = useSelector(state => state.products);
    const customers = useSelector(state => state.customers);
    const employees = useSelector(state => state.employees);

    const unconfirmedOrders = orders.filter(o => o.employeeId === null).map(o => ({ ...o, phoneNumber: customers.find(c => c.customerId === o.customerId)?.phoneNumber }));

    const [activeOrder, setActiveOrder] = useState(unconfirmedOrders[0]?.orderId);

    const activeOrderItems = unconfirmedOrders.find(o => o.orderId === activeOrder)?.lineItems.map(line => {
        const { productName = "", unitPrice } = products.find(p => p.productId === line.productId) ?? {};
        return { ...line, productName, cost: line.quantity * unitPrice, profit: line.pricePaid - (line.quantity * unitPrice) };
    });

    return (
        <Modal id={UNCONFIRMED_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">Unconfirmed Orders</h2>
            <h4>Set the Employee field to confirm an order.</h4>

            <div className="alert">
                <div className="table-container">
                    <DataTable defaultSrc={unconfirmedOrders} idAttr="orderId" updateFunc={actions.updateOrder} activeRow={activeOrder}
                        numericalFields={["orderId", "orderTotal", "profit"]} outerClasses="main-table">
                        <DataColumn columnName="ID" srcAttr="orderId" type="number" classes="clickable" onClick={({ value }) => setActiveOrder(value)} />
                        <DataColumn columnName="Customer" srcAttr="customerName" type="text" />
                        <DataColumn columnName="Phone" srcAttr="phoneNumber" type="text" />
                        <DataColumn columnName="Date" srcAttr="orderDate" type="date" />
                        <DataColumn columnName="Employee" srcAttr="employeeName" name="employeeId" type="text" isEditable isSelect
                            src={employees} optionsFormula={e => `${e.employeeId}: ${e.firstName} ${e.lastName ?? ""}`.trim()} />
                    </DataTable>
                </div>

                <div className="table-container">
                    <DataTable defaultSrc={activeOrderItems} idAttr="orderId" subIdAttr="lineItemNumber" outerClasses="sub-table"
                        numericalFields={["cost", "lineItemNumber", "orderId", "pricePaid", "profit", "quantity"]}>
                        <DataColumn columnName="Line" srcAttr="lineItemNumber" type="number" />
                        <DataColumn columnName="Product" srcAttr="productName" name="productId" type="text" />
                        <DataColumn columnName="Flavor" srcAttr="flavorName" name="flavorId" type="text" />
                        <DataColumn columnName="Quantity" srcAttr="quantity" type="number" />
                        <DataColumn columnName="Price Paid" srcAttr="pricePaid" type="currency" />
                    </DataTable>
                </div>
            </div>
        </Modal>
    );
};

export default UnconfirmedOrders;