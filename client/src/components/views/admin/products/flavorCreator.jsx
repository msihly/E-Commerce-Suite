import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { Form, Input } from "components/form";

const FlavorCreator = ({ productId }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const product = useSelector(state => state.products.find(p => p.productId === productId));

    const handleSubmit = async (formData) => {
        formData.append("productId", productId);
        const res = await dispatch(actions.createFlavor({ formData, history }));
        if (res?.success) toast.success(`Flavor ${res.flavor.flavorName} created`);
    };

    return (
        <Modal id={`${productId}-flavor`} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">{product?.productName}</h2>

            <Form idPrefix={productId} onSubmit={handleSubmit} classes="row j-center thin" submitText="+" submitClasses="submit plus">
                <Input id="new-flavor" name="flavorName" placeholder="Add a flavor..." isRequired />
            </Form>

            <DataTable defaultSrc={product?.flavors} idAttr="flavorId" updateFunc={actions.updateFlavor} classes="full-width">
                <DataColumn columnName="ID" srcAttr="flavorId" type="number" />
                <DataColumn columnName="Name" srcAttr="flavorName" type="text" isEditable />
                <DataColumn columnName="Inventory" srcAttr="quantity" type="number" />
            </DataTable>
        </Modal>
    );
};

export default FlavorCreator;