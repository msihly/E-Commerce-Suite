import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Checkboxes, SubmitButtons, getCheckboxValues, getCheckboxObjValues } from "../common";
import { FILTER_MODAL_ID } from "./";

const FilterModal = ({ defaultFilters, filters, setFilters, setIsFiltered }) => {
    const dispatch = useDispatch();

    const inputs = useSelector(state => state.inputs);

    const clearFilters = () => {
        setFilters(defaultFilters);
        setIsFiltered(false);

        toast.info("Filters cleared");
        dispatch(actions.modalClosed(FILTER_MODAL_ID));
    };

    const updateFilters = () => {
        setFilters({
            ...filters,
            cities: getCheckboxValues(inputs, defaultFilters.cities, "city"),
            states: getCheckboxValues(inputs, defaultFilters.states, "state"),
            zipCodes: getCheckboxValues(inputs, defaultFilters.zipCodes, "zip-code"),
            referrers: getCheckboxObjValues(inputs, defaultFilters.referrers, "referrer"),
        });
        setIsFiltered(true);

        dispatch(actions.modalClosed(FILTER_MODAL_ID));
    };

    return (
        <Modal id={FILTER_MODAL_ID} classes="pad-ctn-1 filter" hasHeader>
            <h2 className="modal-title">Filter Customers</h2>

            <div className="checkbox-row">
                <Checkboxes title="Cities" idPrefix="city" defaultList={defaultFilters.cities} liveList={filters.cities} isCentered />
                <Checkboxes title="States" idPrefix="state" defaultList={defaultFilters.states} liveList={filters.states} isCentered />
                <Checkboxes title="Zip Codes" idPrefix="zip-code" defaultList={defaultFilters.zipCodes} liveList={filters.zipCodes} isCentered />
            </div>

            <Checkboxes title="Referrers" idPrefix="referrer" defaultList={defaultFilters.referrers} liveList={filters.referrers} isObjList isCentered />

            <SubmitButtons {...{ clearFilters, updateFilters}} />
        </Modal>
    )
};

export default FilterModal;