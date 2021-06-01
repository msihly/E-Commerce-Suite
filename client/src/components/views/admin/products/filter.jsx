import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Checkboxes, Conditions, DateRange, SubmitButtons, getCheckboxValues, getConditionValues } from "../common";
import { FILTER_MODAL_ID } from "./";
import { getLocalDateTime } from "utils";

const fieldOptions = [
    { displayed: "Unit Cost", form: "unitPrice" },
    { displayed: "Inventory", form: "quantity" },
    { displayed: "Inventory Cost", form: "totalCost" },
    { displayed: "Revenue", form: "totalRevenue" },
    { displayed: "Profit", form: "totalProfit" },
];

const FilterModal = ({ defaultFilters, filters, setFilters, setIsFiltered }) => {
    const dispatch = useDispatch();

    const inputs = useSelector(state => state.inputs);
    const [startDate, endDate] = ["start-date", "end-date"].map(id => inputs.find(i => i.id === id)?.value);

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
            startDate: getLocalDateTime(startDate),
            endDate: getLocalDateTime(endDate, { isDayEnd: true }),
            types: getCheckboxValues(inputs, defaultFilters.types, "type"),
            conditions: getConditionValues(inputs)
        });
        setIsFiltered(true);

        dispatch(actions.modalClosed(FILTER_MODAL_ID));
    };

    return (
        <Modal id={FILTER_MODAL_ID} classes="pad-ctn-1 filter" hasHeader>
            <h2 className="modal-title">Filter Products</h2>

            <DateRange title="Date Added" filters={filters} startDateName="startDate" endDateName="endDate" />

            <Checkboxes title="Types" idPrefix="type" defaultList={defaultFilters.types} liveList={filters.types} />

            <Conditions {...{ conditions, setConditions, fieldOptions }} />

            <SubmitButtons {...{ clearFilters, updateFilters}} />
        </Modal>
    )
};

export default FilterModal;