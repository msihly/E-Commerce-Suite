import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { Alert, AlertButton } from "components/popovers";
import { DELETE_ORDER_ALERT_ID, DELETE_ORDER_ITEM_ALERT_ID } from "./";
import * as Media from "media";

export const DeleteOrderAlert = ({ orderId }) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const productIds = useSelector(state => state.orders.find(o => o.orderId === orderId)).lineItems.map(line => line.productId);

    const confirmDelete = (closeModal) => {
        dispatch(actions.deleteOrder({ orderId, productIds, history }));
        closeModal();
    };

    return (
        <Alert id={DELETE_ORDER_ALERT_ID} modalClasses="pad-ctn-1 border-red" icon={<Media.TrashcanSVG />} iconClasses="red-2-fill"
            heading={["Delete ", <span className="red-2">{`Order #${orderId}`}</span>, "?"]}
            subheading="This process cannot be undone."
            buttons={[<AlertButton text="Delete" classes="red" onClick={confirmDelete} />]}>
        </Alert>
    );
};

export const DeleteOrderItemAlert = ({ orderId, lineItemNumber }) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const productId = useSelector(state => state.orders.find(o => o.orderId === orderId)?.lineItems?.find(line => line.lineItemNumber === lineItemNumber))?.productId;

    const confirmDelete = (closeModal) => {
        dispatch(actions.deleteOrderItem({ orderId, lineItemNumber, productId, history }));
        closeModal();
    };

    return (
        <Alert id={DELETE_ORDER_ITEM_ALERT_ID} modalClasses="pad-ctn-1 border-red" icon={<Media.TrashcanSVG />} iconClasses="red-2-fill"
            heading={["Delete ", <span className="red-2">{`Order #${orderId} - Line #${lineItemNumber}`}</span>, "?"]}
            subheading="This process cannot be undone."
            buttons={[<AlertButton text="Delete" classes="red" onClick={confirmDelete} />]}>
        </Alert>
    );
};