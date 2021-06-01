import React from "react";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Form } from "components/form";
import { OrderItemRow, ORDER_ITEM_MODAL_ID } from "./";

const OrderItemCreator = ({ activeOrder }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const orders = useSelector(state => state.orders);

    const handleSubmit = async (formData) => {
        const lineItems = orders.find(o => o.orderId === activeOrder).lineItems;
        const lineItemNumber = lineItems.length > 0 ? lineItems.slice(-1)[0].lineItemNumber + 1 : 1;
        formData.append("lineItemNumber", lineItemNumber);

        const res = await dispatch(actions.createOrderItem({ id: activeOrder, formData, history }));
        if (!res?.success) return toast.error("Error adding order item");
    };

    return (
        <Modal id={ORDER_ITEM_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">Add Order Item</h2>
            <Form idPrefix="order" onSubmit={handleSubmit} labelClasses="small glow" submitText="Submit">
                <OrderItemRow id="append-order-item" isRequired hasLabels />
            </Form>
        </Modal>
    );
};

export default OrderItemCreator;