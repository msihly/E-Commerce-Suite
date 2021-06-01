import React, { useState } from "react";
import { useSelector } from "react-redux";
import { AnimateHeight } from "components/wrappers";
import { ListItem } from "components/listItem";
import { Order } from ".";
import { sortArray } from "utils";

const OrderHistory = () => {
    const [activeOrder, setActiveOrder] = useState(null);

    const orders = sortArray(useSelector(state => state.orders), "orderDate", true);

    return (
        <div className="order-history">
            {orders && orders.flatMap(order => [
                <Order key={order.orderId} {...order} isActive={activeOrder === order.orderId} setActive={setActiveOrder} />,
                activeOrder === order.orderId &&
                    <div key={`${order.orderId}-active`}>
                        {order.lineItems.map(line =>
                            <AnimateHeight key={line.lineItemNumber}>
                                <ListItem className="order-item" {...line} price={line.pricePaid} />
                            </AnimateHeight>
                        )}
                    </div>
            ])}
        </div>
    );
};

export default OrderHistory;