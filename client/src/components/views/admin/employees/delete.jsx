import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { Alert, AlertButton } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { DELETE_ALERT_ID } from "./";
import * as Media from "media";

const DeleteAlert = ({ employeeId }) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const affectedOrders = useSelector(state => state.orders).filter(o => o.employeeId === employeeId);

    const confirmDelete = (closeModal) => {
        dispatch(actions.deleteEmployee({ employeeId, history }));
        closeModal();
    };

    return (
        <Alert id={DELETE_ALERT_ID} modalClasses="pad-ctn-1 border-red" icon={<Media.TrashcanSVG />} iconClasses="red-2-fill"
            heading={["Delete all references to ", <span className="red-2">{actions.getEmployeeFullName(employeeId)}</span>, "?"]}
            subheading="This process cannot be undone."
            buttons={[<AlertButton text="Delete" classes="red" onClick={confirmDelete} />]}>
                {affectedOrders.length > 0 && (
                    <div className="table-container">
                        <h3>The following <span className="blue-3">Orders</span> will also be deleted</h3>
                        <DataTable defaultSrc={affectedOrders} idAttr="orderId" numericalFields={["orderId", "quantity"]}>
                            <DataColumn columnName="ID" srcAttr="orderId" type="number" />
                            <DataColumn columnName="Employee" srcAttr="employeeName" type="text" />
                            <DataColumn columnName="Customer" srcAttr="customerName" type="text" />
                            <DataColumn columnName="Order Total" srcAttr="orderTotal" type="currency" />
                            <DataColumn columnName="Profit" srcAttr="profit" type="currency" hasColorScale />
                            <DataColumn columnName="Date" srcAttr="orderDate" type="date" />
                        </DataTable>
                    </div>
                )}
        </Alert>
    );
};

export default DeleteAlert;