import React from "react";
import { useSelector } from "react-redux";
import * as actions from "store/actions";
import { DateRange } from "./common";
import { dateInRange, divide, formatData, sumArray } from "utils";

const Reports = () => {
    const inputs = useSelector(state => state.inputs);
    const [startDate, endDate] = ["start-date", "end-date"].map(id => inputs.find(i => i.id === id)?.value);

    // BEGIN - Assets Section
    const products = useSelector(state => state.products);
    const orders = useSelector(state => state.orders);

    const productTypes = [...new Set(products.map(p => p.productType))].map(type => ({ type, products: products.filter(p => p.productType === type) }));
    productTypes.forEach(type => {
        type.sales = sumArray(type.products, p => sumArray(orders, o => dateInRange(o.orderDate, startDate, endDate) ? actions.getOrderProductRevenue(o, p.productId) : 0));
        type.costUnsold = sumArray(type.products, p => p.unitPrice * (actions.getInflowsTotal(p.productId) - sumArray(orders, actions.getOrderProductQuantity, p.productId)));
        type.costSold = sumArray(type.products, p => sumArray(orders, o => dateInRange(o.orderDate, startDate, endDate) ? actions.getOrderProductCost(o, p.productId, p.unitPrice) : 0));
    });

    const totalRevenue = sumArray(productTypes, type => type.sales);
    const totalInventory = sumArray(productTypes, type => type.costUnsold);
    const totalCOGS = sumArray(productTypes, type => type.costSold);
    const totalAssets = totalRevenue + totalInventory;
    // END - Assets Section

    // BEGIN - Expenses Section
    const expenses = useSelector(state => state.expenses);

    const expenseTypes = [...new Set(expenses.map(e => e.expenseType))].map(type => ({ type, expenses: expenses.filter(e => e.expenseType === type) }));
    expenseTypes.forEach(type => {
        type.paid = sumArray(type.expenses, e => (e.datePaid && dateInRange(e.datePaid, startDate, endDate)) ? e.expenseAmount : 0);
        type.unpaid = sumArray(type.expenses, e => (e.datePaid === null && dateInRange(e.dateIncurred, startDate, endDate)) ? e.expenseAmount : 0);
    });

    const totalExpensesPaid = sumArray(expenseTypes, type => type.paid);
    const totalExpensesUnpaid = sumArray(expenseTypes, type => type.unpaid);
    const totalExpenses = totalExpensesPaid + totalExpensesUnpaid;
    // END - Expenses Section

    // BEGIN - Key Performance Indicators Section
    const netIncome = totalRevenue - totalCOGS - totalExpenses;
    const inventoryTurnover = divide(totalCOGS, totalInventory);
    const assetTurnover = divide(totalRevenue, totalAssets);
    const returnOnAssets = divide(netIncome, totalAssets);
    const profitMargin = divide(netIncome, totalRevenue);
    // END - Key Performance Indicators Section

    return (
        <div className="reports">
            <DateRange />

            <Section header="Assets">
                <Breakdown name="Sales">
                    {productTypes.map(p => <Line key={p.type} name={p.type} value={p.sales} />)}
                    <Line name="Total Revenue" value={totalRevenue} lineClasses="total" hasColorScale hasDollar />
                </Breakdown>

                <Breakdown name="Cost of Goods Unsold">
                    {productTypes.map(p => <Line key={p.type} name={p.type} value={p.costUnsold} />)}
                    <Line name="Total Inventory" value={totalInventory} lineClasses="total" hasDollar />
                </Breakdown>

                <Line name="Total Assets" value={totalAssets} lineClasses="total" hasDollar />
            </Section>

            <Section header="Expenses">
                <Breakdown name="Cost of Goods Sold">
                    {productTypes.map(p => <Line key={p.type} name={p.type} value={p.costSold} />)}
                    <Line name="Total COGS" value={totalCOGS} lineClasses="total" hasDollar isExpense />
                </Breakdown>

                <Breakdown name="Other Expenses">
                    <SubCategory name="Paid">
                        {expenseTypes.map(e => <Line key={e.type} name={e.type} value={e.paid} />)}
                        <Line name="Total Paid" value={totalExpensesPaid} lineClasses="total" hasDollar />
                    </SubCategory>

                    <SubCategory name="Unpaid">
                        {expenseTypes.map(e => <Line key={e.type} name={e.type} value={e.unpaid} />)}
                        <Line name="Total Unpaid" value={totalExpensesUnpaid} lineClasses="total" hasDollar />
                    </SubCategory>
                </Breakdown>

                <Line name="Total Expenses" value={totalExpenses} lineClasses="total" hasDollar isExpense />
            </Section>

            <Section header="Key Performance Indicators">
                <Line name="Net Income" value={netIncome} hasColorScale hasDollar
                    nameTitle="Total Revenue - Total COGS - Total Expenses"  />
                <Line name="Asset Turnover" value={assetTurnover} type="percent" hasColorScale
                    nameTitle="Total Revenue / Total Assets" />
                <Line name="Inventory Turnover" value={inventoryTurnover} type="percent" hasColorScale
                    nameTitle="COGS / Total Inventory" />
                <Line name="Return On Assets" value={returnOnAssets} type="percent" hasColorScale
                    nameTitle="Net Income / Total Assets" />
                <Line name="Profit Margin" value={profitMargin} type="percent" hasColorScale
                    nameTitle="Net Income / Total Revenue" />
            </Section>
        </div>
    );
};

const Section = ({ children, header }) => (
    <section className="section">
        <h3 className="section-header">{header}</h3>
        {children}
    </section>
);

const Breakdown = ({ children, name }) => (
    <article className="breakdown">
        <h4 className="breakdown-header">{name}</h4>
        {children}
    </article>
);

const SubCategory = ({ children, name }) => (
    <div className="sub-category">
        <h4 className="sub-category-header">{name}</h4>
        {children}
    </div>
);

const Line = ({ hasColorScale, hasDollar, isExpense, lineClasses, name, nameTitle = null, type = "currency", value, valueClasses, valueTitle = null }) => {
    const getLineClasses = () => {
        let className = "line";
        if (lineClasses) className += ` ${lineClasses}`;
        return className;
    };

    const getValueClasses = () => {
        let className = "line-value";
        if (type === "currency") className += " currency";
        if (isExpense && value !== 0) className += " negative";
        if (hasColorScale && value !== 0) className += ` ${value < 0 ? "negative" : "positive"}`;
        if (valueClasses) className += ` ${valueClasses}`;
        return className;
    };

    return (
        <div className={getLineClasses()}>
            <span className="line-name" title={nameTitle}>{name}</span>
            <span className={getValueClasses()} title={valueTitle}>
                {`${hasDollar ? "$ " : ""}${formatData(value, type)}${type === "percent" ? " %" : ""}`}
            </span>
        </div>
    );
};

export default Reports;