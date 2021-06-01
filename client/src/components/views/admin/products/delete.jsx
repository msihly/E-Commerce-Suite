import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { Alert, AlertButton } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { DELETE_ALERT_ID } from "./";
import * as Media from "media";

const DeleteAlert = ({ productId }) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const inflows = useSelector(state => state.inflows);
    const orders = useSelector(state => state.orders);

    const affectedInflows = inflows.filter(i => i.productId === productId);

    const affectedOrders = orders.filter(o => o.lineItems.filter(l => l.productId === productId).length).map(o => {
        const lineItem = o.lineItems.find(l => l.productId === productId);
        return {
            ...o,
            lineItemNumber: lineItem.lineItemNumber,
            productName: actions.getProduct(lineItem.productId)?.productName ?? "",
            quantity: lineItem.quantity
        };
    });

    const confirmDelete = (closeModal) => {
        dispatch(actions.deleteProduct({ productId, orderIds: affectedOrders.map(o => o.orderId), history }));
        closeModal();
    };

    return (
        <Alert id={DELETE_ALERT_ID} modalClasses="pad-ctn-2 border-red" icon={<Media.TrashcanSVG />} iconClasses="red-2-fill"
            heading={["Delete all references to ", <span className="red-2">{actions.getProduct(productId)?.productName}</span>, "?"]}
            subheading="This process cannot be undone."
            buttons={[<AlertButton text="Delete" classes="red" onClick={confirmDelete} />]}>
                {affectedInflows.length > 0 && (
                    <div className="table-container">
                        <h3>The following <span className="blue-3">Inflows</span> will also be deleted</h3>
                        <DataTable defaultSrc={affectedInflows} idAttr="inflowId" numericalFields={["inflowId", "productId", "quantity"]}>
                            <DataColumn columnName="ID" srcAttr="inflowId" type="number" />
                            <DataColumn columnName="Product" srcAttr="productName" type="text" />
                            <DataColumn columnName="Quantity" srcAttr="quantity" type="number" />
                            <DataColumn columnName="Date Added" srcAttr="dateAdded" type="date" />
                            <DataColumn columnName="Date Paid" srcAttr="datePaid" type="date" />
                        </DataTable>
                    </div>
                )}

                {affectedOrders.length > 0 && (
                    <div className="table-container">
                        <h3>The following <span className="blue-3">Order Items</span> will also be deleted</h3>
                        <DataTable defaultSrc={affectedOrders} idAttr="orderId" numericalFields={["orderId", "lineItemNumber", "quantity"]}>
                            <DataColumn columnName="Order ID" srcAttr="orderId" type="number" />
                            <DataColumn columnName="Line" srcAttr="lineItemNumber" type="number" />
                            <DataColumn columnName="Product" srcAttr="productName" type="text" />
                            <DataColumn columnName="Quantity" srcAttr="quantity" type="number" />
                            <DataColumn columnName="Customer" srcAttr="customerName" type="text" />
                            <DataColumn columnName="Date" srcAttr="orderDate" type="date" />
                        </DataTable>
                    </div>
                )}
        </Alert>
    );
};

export default DeleteAlert;