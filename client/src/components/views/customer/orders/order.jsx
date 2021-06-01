import React from "react";
import { formatData, formatDate, sumArray } from "utils";
import * as Media from "media";

const Order = ({ isActive, lineItems, orderDate, orderId, setActive }) => {
    const orderTotal = sumArray(lineItems, line => line.pricePaid);

    return (
        <div className="order">
            <div className="item-info">
                <span>{`Order #${orderId}`}</span>
                <span>{formatDate(orderDate)}</span>
            </div>

            <div className="item-price">{`$ ${formatData(orderTotal, "integer")}`}</div>

            <div className="item-buttons">
                <span onClick={() => setActive(isActive ? null : orderId)} className={isActive ? "rotate-180" : null}>
                    <Media.ChevronSVG />
                </span>
            </div>
        </div>
    );
};

export default Order;