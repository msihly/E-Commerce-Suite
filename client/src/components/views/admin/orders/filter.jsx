import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Checkboxes, Conditions, DateRange, SubmitButtons, getCheckboxObjValues, getConditionValues } from "../common";
import { FILTER_MODAL_ID } from "./";
import { getLocalDateTime } from "utils";

const fieldOptions = [
    { displayed: "Order Total", form: "orderTotal" },
    { displayed: "Profit", form: "profit" },
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
            customers: getCheckboxObjValues(inputs, defaultFilters.customers, "customer"),
            employees: getCheckboxObjValues(inputs, defaultFilters.employees, "employee"),
            products: getCheckboxObjValues(inputs, defaultFilters.products, "product"),
            conditions: getConditionValues(inputs)
        });
        setIsFiltered(true);

        dispatch(actions.modalClosed(FILTER_MODAL_ID));
    };

    return (
        <Modal id={FILTER_MODAL_ID} classes="pad-ctn-1 filter" hasHeader>
            <h2 className="modal-title">Filter Products</h2>

            <DateRange title="Date Added" filters={filters} startDateName="startDate" endDateName="endDate" />

            <div className="checkbox-column">
                <Checkboxes title="Employees" idPrefix="employee" defaultList={defaultFilters.employees} liveList={filters.employees} isObjList />
                <Checkboxes title="Customers" idPrefix="customer" defaultList={defaultFilters.customers} liveList={filters.customers} isObjList />
                <Checkboxes title="Products" idPrefix="product" defaultList={defaultFilters.products} liveList={filters.products} isObjList />
            </div>

            <Conditions {...{ conditions, setConditions, fieldOptions }} />

            <SubmitButtons {...{ clearFilters, updateFilters}} />
        </Modal>
    )
};

export default FilterModal;