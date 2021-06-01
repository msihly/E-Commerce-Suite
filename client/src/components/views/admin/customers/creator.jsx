import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Form, Input } from "components/form";
import { DropSelect } from "components/dropdowns";
import { CUSTOMER_MODAL_ID } from "./";

const CustomerCreator = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const customers = useSelector(state => state.customers);

    const handleSubmit = async (formData) => {
        const res = await dispatch(actions.createCustomer({ formData, history }));
        if (!res?.success) return toast.error("Error adding customer");
    };

    return (
        <Modal id={CUSTOMER_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">New Customer</h2>

            <Form idPrefix="customer" onSubmit={handleSubmit} labelClasses="small glow" submitText="Submit">
                <div className="row equal-width">
                    <Input id="first-name" name="firstName" label="First Name" placeholder isRequired />
                    <Input id="last-name" name="lastName" label="Last Name" placeholder />
                    <Input id="phone" name="phoneNumber" label="Phone" placeholder />
                    <DropSelect id="referrer" name="referrerId" label="Referrer" src={customers} srcAttr="customerId"
                        formula={c => `${c.customerId}: ${c.firstName} ${c.lastName ?? ""}`.trim()} />
                </div>

                <div className="row equal-width">
                    <Input id="street" name="street" label="Street" suggAttr="street" suggSrc={customers} placeholder />
                    <Input id="city" name="city" label="City" suggAttr="city" suggSrc={customers} placeholder />
                    <Input id="state" name="state" label="State" suggAttr="state" suggSrc={customers} placeholder />
                    <Input id="zip-code" name="zipCode" label="Zip Code" suggAttr="zipCode" suggSrc={customers} placeholder />
                </div>
            </Form>
        </Modal>
    );
};

export default CustomerCreator;