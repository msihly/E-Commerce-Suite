import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { CircleButton, FloatingMenu } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { CURRENT_DATE, PERIOD_START } from "../common";
import { DeleteAlert, FilterModal, FlavorCreator, ProductCreator, DELETE_ALERT_ID, FILTER_MODAL_ID, PRODUCT_MODAL_ID } from "./";
import { dateInRange, stringOperators } from "utils";
import * as Media from "media";

const NUMERICAL_FIELDS = ["productId", "unitPrice", "quantity", "totalCost", "totalRevenue", "totalProfit"];

const Products = () => {
    const dispatch = useDispatch();

    const [activeProduct, setActiveProduct] = useState(null);
    const products = useSelector(state => state.products);

    const modals = useSelector(state => state.modals);
    const [isCreatorOpen, isDeleteAlertOpen, isFilterOpen, isFlavorsModalOpen] =
        [PRODUCT_MODAL_ID, DELETE_ALERT_ID, FILTER_MODAL_ID, `${activeProduct}-flavor`].map(id => modals.find(m => m.id === id)?.isOpen ?? false);

    const openFlavorsModal = (productId) => {
        setActiveProduct(productId);
        dispatch(actions.modalOpened(`${productId}-flavor`));
    };

    // BEGIN - Product Deletion
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const handleDelete = (productId) => {
        setDeleteId(productId);
        dispatch(actions.modalOpened(DELETE_ALERT_ID));
    };
    // END - Product Deletion

    // BEGIN - Filtering
    const types = useMemo(() => [...new Set(products.map(p => p.productType))], [products]);

    const defaultFilters = {
        startDate: PERIOD_START,
        endDate: CURRENT_DATE,
        types,
        conditions: []
    };

    const [isFiltered, setIsFiltered] = useState(false);
    const [filters, setFilters] = useState({ ...defaultFilters });

    const displayedProducts = useMemo(() => (
        isFiltered ? products.filter(p => {
            if (!dateInRange(p.dateAdded, filters.startDate, filters.endDate)) return false;
            if (!filters.types.includes(p.productType)) return false;
            if (filters.conditions.length > 0) {
                const failedConditions = filters.conditions.filter(c => !stringOperators(c.operator, +p[c.field], +c.value));
                if (failedConditions.length > 0) return false;
            }
            return true;
        }) : products
    ), [filters, isFiltered, products]);

    useEffect(() => {
        const [source, displayed] = [products.length, displayedProducts.length];
        if (displayed !== source) toast.info(`${source - displayed} products filtered`);
    }, [displayedProducts, products]);
    // END - Filtering

    return (
        <Fragment>
            <DataTable defaultSrc={displayedProducts} idAttr="productId" updateFunc={actions.updateProduct}
                numericalFields={NUMERICAL_FIELDS} classes="full-width" {...{ handleDelete, isDeleteMode }}>
                <DataColumn columnName="ID" srcAttr="productId" type="number" classes="clickable" onClick={({ value }) => openFlavorsModal(value)} />
                <DataColumn columnName="Name" srcAttr="productName" type="text" isEditable />
                <DataColumn columnName="Type" srcAttr="productType" type="text" isEditable />
                <DataColumn columnName="Description" srcAttr="productDescription" type="text" isEditable />
                <DataColumn columnName="Inventory" srcAttr="quantity" type="number" />
                <DataColumn columnName="Unit Cost" srcAttr="unitPrice" type="currency" isEditable />
                <DataColumn columnName="Inventory Cost" srcAttr="totalCost" type="currency" />
                <DataColumn columnName="Revenue" srcAttr="totalRevenue" type="currency" />
                <DataColumn columnName="Profit" srcAttr="totalProfit" type="currency" hasColorScale />
                <DataColumn columnName="Date Added" srcAttr="dateAdded" type="date" isEditable />
            </DataTable>

            <FloatingMenu position="bottom" isHorizontal>
                <CircleButton title="Create Product" onClick={() => dispatch(actions.modalOpened(PRODUCT_MODAL_ID))}>
                    <Media.PlusSVG />
                    {isCreatorOpen && <ProductCreator />}
                </CircleButton>

                <CircleButton title="Filter Products" onClick={() => dispatch(actions.modalOpened(FILTER_MODAL_ID))} isActive={isFiltered}>
                    <Media.FilterSVG />
                    {isFilterOpen && <FilterModal {...{ defaultFilters, filters, setFilters, setIsFiltered }} />}
                </CircleButton>

                <CircleButton title={`${isDeleteMode ? "Disable" : "Enable"} Delete Mode`} classes="red"
                    onClick={() => setIsDeleteMode(!isDeleteMode)} isActive={isDeleteMode}>
                    <Media.TrashcanSVG />
                    {isDeleteAlertOpen && <DeleteAlert id={DELETE_ALERT_ID} productId={deleteId} />}
                </CircleButton>
            </FloatingMenu>

            {isFlavorsModalOpen && <FlavorCreator productId={activeProduct} />}
        </Fragment>
    );
};

export default Products;