import React from "react";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Form, Input } from "components/form";
import { DropSelect } from "components/dropdowns";
import { OrderItemRow, ORDER_MODAL_ID } from "./";
import { getLocalDateTime } from "utils";

const OrderCreator = () => {
    const history = useHistory();

    const dispatch = useDispatch();

    const customers = useSelector(state => state.customers);
    const employees = useSelector(state => state.employees);

    const handleSubmit = async (formData) => {
        const errors = [];

        if (!formData.get("orderDate")) errors.push("Date is required");
        if (!formData.get("customerId")) errors.push("Customer is required");
        if (!formData.get("employeeId")) errors.push("Employee is required");

        if (errors.length) return toast.error(errors.join("\n"));

        const rawFields = ["productId", "flavorId", "quantity", "pricePaid"];
        const fields = rawFields.map(e => formData.getAll(e));
        rawFields.forEach(e => formData.delete(e));

        const lineItems = fields[0].map((e, i) => ({
            lineItemNumber: i + 1,
            productId: +fields[0][i],
            flavorId: +fields[1][i] ? +fields[1][i] : null,
            quantity: +fields[2][i],
            pricePaid: +fields[3][i],
        })).filter(line => {
            if (line.productId === 0) return (line.quantity || line.pricePaid) ? !errors.push(`Product field is required in line #${line.lineItemNumber}`) : false;
            if (isNaN(line.quantity)) return !errors.push(`Quantity in line #${line.lineItemNumber} is not a valid number`);
            if (isNaN(line.pricePaid)) return !errors.push(`Price Paid in line #${line.lineItemNumber} is not a valid number`);
            return true;
        });

        if (!lineItems.length) errors.push("Must have at least one valid line item");
        if (errors.length) return toast.error(errors.join("\n"));

        formData.append("lineItems", JSON.stringify(lineItems));

        const res = await dispatch(actions.createOrder({ formData, history }));
        if (!res?.success) return toast.error("Error adding order");
    };

    return (
        <Modal id={ORDER_MODAL_ID} classes="pad-ctn-2" hasHeader>
            <h2 className="modal-title">New Order</h2>

            <Form idPrefix="order" onSubmit={handleSubmit} submitText="Submit" classes="column" labelClasses="small glow">
                <div className="row equal-width">
                    <Input id="date" name="orderDate" label="Date" type="date" initValue={getLocalDateTime(null, { type: "date" })} isRequired />
                    <DropSelect id="customer" name="customerId" label="Customer" isRequired
                        src={customers} srcAttr="customerId" formula={c => `${c.customerId}: ${c.firstName} ${c.lastName ?? ""}`.trim()} />
                    <DropSelect id="employee" name="employeeId" label="Employee" isRequired
                        src={employees} srcAttr="employeeId" formula={e => `${e.employeeId}: ${e.firstName} ${e.lastName ?? ""}`.trim()} />
                </div>

                <OrderItemRow id="0" isRequired hasLabels />
                {[...Array(4)].map((_, i) => <OrderItemRow key={i + 1} id={i + 1} />)}
            </Form>
        </Modal>
    );
};

export default OrderCreator;