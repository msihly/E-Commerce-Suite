import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { Alert, AlertButton } from "components/popovers";
import { DELETE_ALERT_ID } from "./";
import * as Media from "media";

const DeleteAlert = ({ inflowId }) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const inflow = actions.getInflow(inflowId);

    const products = useSelector(state => state.products);
    const productIds = products.filter(p => p.productId === inflow.productId).map(p => p.productId);

    const confirmDelete = (closeModal) => {
        dispatch(actions.deleteInflow({ inflowId, productIds, history }));
        closeModal();
    };

    return (
        <Alert id={DELETE_ALERT_ID} modalClasses="pad-ctn-1 border-red" icon={<Media.TrashcanSVG />} iconClasses="red-2-fill"
            heading={["Delete ", <span className="red-2">{`Inflow #${inflowId} - ${inflow.productName}`}</span>, "?"]}
            subheading="This process cannot be undone."
            buttons={[<AlertButton text="Delete" classes="red" onClick={confirmDelete} />]}>
        </Alert>
    );
};

export default DeleteAlert;