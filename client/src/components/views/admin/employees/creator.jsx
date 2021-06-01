import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Form, Input } from "components/form";
import { EMPLOYEE_MODAL_ID } from "./";

const CustomerCreator = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const handleSubmit = async (formData) => {
        const res = await dispatch(actions.createEmployee({ formData, history }));
        if (!res?.success) return toast.error("Error adding employee");
    };

    return (
        <Modal id={EMPLOYEE_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">New Employee</h2>
            <Form idPrefix="employee" onSubmit={handleSubmit} labelClasses="small glow" submitText="Submit">
                <div className="row equal-width">
                    <Input id="first-name" name="firstName" label="First Name" isRequired placeholder />
                    <Input id="last-name" name="lastName" label="Last Name" placeholder />
                    <Input id="phone" name="phoneNumber" label="Phone" placeholder />
                </div>
            </Form>
        </Modal>
    );
};

export default CustomerCreator;