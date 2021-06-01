import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Checkboxes, Conditions, DateRange, SubmitButtons, getCheckboxValues, getCheckboxObjValues, getConditionValues } from "../common";
import { FILTER_MODAL_ID } from "./";
import { getLocalDateTime } from "utils";

const fieldOptions = [{ displayed: "Amount", form: "expenseAmount" }];

const FilterModal = ({ defaultFilters, filters, setFilters, setIsFiltered }) => {
    const dispatch = useDispatch();

    const inputs = useSelector(state => state.inputs);
    const [incurredStartDate, incurredEndDate, paidStartDate, paidEndDate] =
        ["incurred-start-date", "incurred-end-date", "paid-start-date", "paid-end-date"].map(id => inputs.find(i => i.id === id)?.value);

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
            incurredStartDate: getLocalDateTime(incurredStartDate),
            incurredEndDate: getLocalDateTime(incurredEndDate, { isDayEnd: true }),
            paidStartDate: getLocalDateTime(paidStartDate),
            paidEndDate: getLocalDateTime(paidEndDate, { isDayEnd: true }),
            types: getCheckboxValues(inputs, defaultFilters.types, "type"),
            statuses: getCheckboxValues(inputs, defaultFilters.statuses, "status"),
            payees: getCheckboxObjValues(inputs, defaultFilters.payees, "payee"),
            conditions: getConditionValues(inputs)
        });
        setIsFiltered(true);

        dispatch(actions.modalClosed(FILTER_MODAL_ID));
    };

    return (
        <Modal id={FILTER_MODAL_ID} classes="pad-ctn-1 filter" hasHeader>
            <h2 className="modal-title">Filter Expenses</h2>

            <DateRange title="Date Incurred" idPrefix="incurred" filters={filters} startDateName="incurredStartDate" endDateName="incurredEndDate" />
            <DateRange title="Date Paid" idPrefix="paid" filters={filters} startDateName="paidStartDate" endDateName="paidEndDate" />

            <Checkboxes title="Types" idPrefix="type" defaultList={defaultFilters.types} liveList={filters.types} />
            <Checkboxes title="Statuses" idPrefix="status" defaultList={defaultFilters.statuses} liveList={filters.statuses} />
            <Checkboxes title="Payees" idPrefix="payee" defaultList={defaultFilters.payees} liveList={filters.payees} isObjList />

            <Conditions {...{ conditions, setConditions, fieldOptions }} />

            <SubmitButtons {...{ clearFilters, updateFilters}} />
        </Modal>
    )
};

export default FilterModal;