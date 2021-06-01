import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { FormContext, Input } from "components/form";
import { DropSelect } from "components/dropdowns";

const OrderItemRow = ({ hasLabels, id, isRequired }) => {
    const context = useContext(FormContext);

    const inputs = useSelector(state => state.inputs);
    const products = useSelector(state => state.products);

    const productInput = inputs.find(i => i.id === `order-${id}-product`);
    const activeFlavors = products.find(p => p.productId === productInput?.value)?.flavors;

    return (
        <div className={context?.classes ?? `row equal-width`}>
            <DropSelect id={`${id}-product`} name="productId" label={hasLabels ? "Product" : null} placeholder="Product" {...{ isRequired }}
                src={products} srcAttr="productId" formula={p => `${p.productId}: ${p.productName}`} />
            <DropSelect id={`${id}-flavor`} name="flavorId" label={hasLabels ? "Flavor" : null} placeholder="Flavor"
                src={activeFlavors} srcAttr="flavorId" formula={f => f.flavorName} />
            <Input id={`${id}-quantity`} name="quantity" label={hasLabels ? "Quantity" : null} placeholder="Quantity" {...{ isRequired }} />
            <Input id={`${id}-pricePaid`} name="pricePaid" label={hasLabels ? "Price Paid" : null} placeholder="Price Paid" {...{ isRequired }} />
        </div>
    );
};

export default OrderItemRow;