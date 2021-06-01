import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { CircleButton, FloatingMenu } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { CURRENT_DATE, PERIOD_START } from "../common";
import { DeleteAlert, FilterModal, InflowCreator, DELETE_ALERT_ID, FILTER_MODAL_ID, INFLOW_MODAL_ID } from "./";
import { dateInRange, stringOperators } from "utils";
import * as Media from "media";

const NUMERICAL_FIELDS = ["inflowId", "productId", "quantity"];

const Inflows = () => {
    const dispatch = useDispatch();

    const inflows = useSelector(state => state.inflows);
    const products = useSelector(state => state.products);
    const orders = useSelector(state => state.orders);

    const modals = useSelector(state => state.modals);
    const [isCreatorOpen, isDeleteAlertOpen, isFilterOpen] = [INFLOW_MODAL_ID, DELETE_ALERT_ID, FILTER_MODAL_ID]
        .map(id => modals.find(m => m.id === id)?.isOpen ?? false);

    // BEGIN - Inflow Deletion
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const handleDelete = (inflowId) => {
        setDeleteId(inflowId);
        dispatch(actions.modalOpened(DELETE_ALERT_ID));
    };
    // END - Inflow Deletion

    // BEGIN - Filtering
    const productSet = useMemo(() => [...new Set(inflows.map(i => i.productId))].map(id => ({ displayed: inflows.find(i => i.productId === id)?.productName, form: id })), [inflows]);

    const defaultFilters = {
        addedStartDate: PERIOD_START,
        addedEndDate: CURRENT_DATE,
        paidStartDate: PERIOD_START,
        paidEndDate: CURRENT_DATE,
        products: productSet,
        conditions: []
    };

    const [isFiltered, setIsFiltered] = useState(false);
    const [filters, setFilters] = useState({ ...defaultFilters });

    const displayedInflows = useMemo(() => (
        isFiltered ? inflows.filter(i => {
            if (!dateInRange(i.dateAdded, filters.addedStartDate, filters.addedEndDate)) return false;
            if (i.datePaid !== null && !dateInRange(i.datePaid, filters.paidStartDate, filters.paidEndDate)) return false;
            if (!filters.products.find(p => p.form === i.productId)) return false;
            if (filters.conditions.length > 0) {
                const failedConditions = filters.conditions.filter(c => !stringOperators(c.operator, +i[c.field], +c.value));
                if (failedConditions.length > 0) return false;
            }
            return true;
        }) : inflows
    ), [filters, isFiltered, inflows]);

    useEffect(() => {
        const [source, displayed] = [inflows.length, displayedInflows.length];
        if (displayed !== source) toast.info(`${source - displayed} inflows filtered`);
    }, [displayedInflows, inflows]);
    // END - Filtering

    return (
        <Fragment>
            <DataTable defaultSrc={displayedInflows} idAttr="inflowId" updateFunc={obj => actions.updateInflow({ ...obj, inflows, orders })}
                {...{ isDeleteMode, handleDelete }} numericalFields={NUMERICAL_FIELDS} classes="full-width">
                <DataColumn columnName="ID" srcAttr="inflowId" type="number" />
                <DataColumn columnName="Product" srcAttr="productName" name="productId" type="text" isEditable isSelect
                    src={products} optionsFormula={p => `${p.productId}: ${p.productName}`} />
                <DataColumn columnName="Flavor" srcAttr="flavorName" name="flavorId" type="text" isEditable isSelect
                    src={row => products.find(p => p.productId === row.productId)?.flavors} optionsFormula={f => f.flavorName} />
                <DataColumn columnName="Quantity" srcAttr="quantity" type="number" isEditable />
                <DataColumn columnName="Date Added" srcAttr="dateAdded" type="date" isEditable />
                <DataColumn columnName="Date Paid" srcAttr="datePaid" type="date" isEditable />
            </DataTable>

            <FloatingMenu position="bottom" isHorizontal>
                <CircleButton title="Create Inflow" onClick={() => dispatch(actions.modalOpened(INFLOW_MODAL_ID))}>
                    <Media.PlusSVG />
                    {isCreatorOpen && <InflowCreator />}
                </CircleButton>

                <CircleButton title="Filter Inflows" onClick={() => dispatch(actions.modalOpened(FILTER_MODAL_ID))} isActive={isFiltered}>
                    <Media.FilterSVG />
                    {isFilterOpen && <FilterModal {...{ defaultFilters, filters, setFilters, setIsFiltered }} />}
                </CircleButton>

                <CircleButton title={`${isDeleteMode ? "Disable" : "Enable"} Delete Mode`} classes="red"
                    onClick={() => setIsDeleteMode(!isDeleteMode)} isActive={isDeleteMode}>
                    <Media.TrashcanSVG />
                    {isDeleteAlertOpen && <DeleteAlert id={DELETE_ALERT_ID} inflowId={deleteId} />}
                </CircleButton>
            </FloatingMenu>
        </Fragment>
    );
};

export default Inflows;