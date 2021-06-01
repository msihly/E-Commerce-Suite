import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Checkboxes, Conditions, DateRange, SubmitButtons, getCheckboxObjValues, getConditionValues } from "../common";
import { FILTER_MODAL_ID } from "./";
import { getLocalDateTime } from "utils";

const fieldOptions = [{ displayed: "Quantity", form: "quantity" }];

const FilterModal = ({ defaultFilters, filters, setFilters, setIsFiltered }) => {
    const dispatch = useDispatch();

    const inputs = useSelector(state => state.inputs);
    const [addedStartDate, addedEndDate, paidStartDate, paidEndDate] =
        ["added-start-date", "added-end-date", "paid-start-date", "paid-end-date"].map(id => inputs.find(i => i.id === id)?.value);

    const [conditions, setConditions] = useState(filters.conditions);

    const clearFilters = () => {
        setFilters(defaultFilters);
        setIsFiltered(false);

        toast.info("Filters cleared");
        dispatch(actions.modalClosed(FILTER_MODAL_ID));
    };

    const updateFilters = () => {
        setFilters({
            ...filters,
            addedStartDate: getLocalDateTime(addedStartDate),
            addedEndDate: getLocalDateTime(addedEndDate, { isDayEnd: true }),
            paidStartDate: getLocalDateTime(paidStartDate),
            paidEndDate: getLocalDateTime(paidEndDate, { isDayEnd: true }),
            products: getCheckboxObjValues(inputs, defaultFilters.products, "product"),
            conditions: getConditionValues(inputs)
        });
        setIsFiltered(true);

        dispatch(actions.modalClosed(FILTER_MODAL_ID));
    };

    return (
        <Modal id={FILTER_MODAL_ID} classes="pad-ctn-1 filter" hasHeader>
            <h2 className="modal-title">Filter Inflows</h2>

            <DateRange title="Date Added" idPrefix="added" filters={filters} startDateName="addedStartDate" endDateName="addedEndDate" />
            <DateRange title="Date Paid" idPrefix="paid" filters={filters} startDateName="paidStartDate" endDateName="paidEndDate" />

            <Checkboxes title="Products" idPrefix="product" defaultList={defaultFilters.products} liveList={filters.products} isObjList />

            <Conditions {...{ conditions, setConditions, fieldOptions }} />

            <SubmitButtons {...{ clearFilters, updateFilters}} />
        </Modal>
    )
};

export default FilterModal;