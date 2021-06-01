import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Form, Input } from "components/form";
import { PRODUCT_MODAL_ID } from ".";

const ProductCreator = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const products = useSelector(state => state.products);

    const handleSubmit = async (formData) => {
        const res = await dispatch(actions.createProduct({ formData, history }));
        if (!res?.success) return toast.error("Error adding product");
    };

    return (
        <Modal id={PRODUCT_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">New Product</h2>
            <Form idPrefix="product" onSubmit={handleSubmit} labelClasses="small glow" submitText="Submit">
                <div className="row equal-width">
                    <Input id="name" name="productName" label="Name" suggSrc={products} suggAttr="productName" placeholder isRequired />
                    <Input id="type" name="productType" label="Type" suggSrc={products} suggAttr="productType" placeholder isRequired />
                </div>

                <Input id="description" name="productDescription" label="Description" placeholder />

                <div className="row j-center text-center">
                    <Input id="unit-price" name="unitPrice" label="Unit Cost" type="number" isRequired classes="narrow-input text-center" />
                </div>
            </Form>
        </Modal>
    );
};

export default ProductCreator;