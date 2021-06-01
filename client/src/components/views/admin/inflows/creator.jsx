import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { DropSelect } from "components/dropdowns";
import { Modal } from "components/popovers";
import { Form, Input } from "components/form";
import { CURRENT_DATE } from "../common";
import { INFLOW_MODAL_ID } from "./";
import { getLocalDateTime } from "utils";

const InflowCreator = () => {
    const history = useHistory();

    const dispatch = useDispatch();

    const productInput = useSelector(state => state.inputs.find(i => i.id === "inflow-product"));
    const products = useSelector(state => state.products);
    const activeFlavors = products.find(p => p.productId === productInput?.value)?.flavors;

    const handleSubmit = async (formData) => {
        const res = await dispatch(actions.createInflow({ formData, history }));
        if (!res?.success) return toast.error("Error adding inflow");
    };

    return (
        <Modal id={INFLOW_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">New Inflow</h2>

            <Form idPrefix="inflow" onSubmit={handleSubmit} labelClasses="small glow" submitText="Submit">
                <div className="row equal-width">
                    <DropSelect id="product" name="productId" label="Product" src={products} srcAttr="productId"
                        formula={p => `${p.productId}: ${p.productName}`} isRequired />
                    <DropSelect id="flavor" name="flavorId" label="Flavor"
                        src={activeFlavors} srcAttr="flavorId" formula={f => f.flavorName} />
                    <Input id="quantity" name="quantity" label="Quantity" placeholder isRequired />
                </div>

                <div className="row equal-width">
                    <Input id="date-added" name="dateAdded" label="Date Added" type="date" initValue={getLocalDateTime(CURRENT_DATE, { type: "date" })} placeholder isRequired />
                    <Input id="date-paid" name="datePaid" label="Date Paid" type="date" placeholder />
                </div>
            </Form>
        </Modal>
    );
};

export default InflowCreator;