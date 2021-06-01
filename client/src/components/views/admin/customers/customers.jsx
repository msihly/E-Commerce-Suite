import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { CircleButton, FloatingMenu } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { CustomerCreator, DeleteAlert, FilterModal, CUSTOMER_MODAL_ID, DELETE_ALERT_ID, FILTER_MODAL_ID } from "./";
import { copyToClipboard } from "utils";
import * as Media from "media";

const NUMERICAL_FIELDS = ["customerId", "referrerId"];

const Customers = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const customers = useSelector(state => state.customers);

    const modals = useSelector(state => state.modals);
    const [isCreatorOpen, isDeleteAlertOpen, isFilterOpen] =
        [CUSTOMER_MODAL_ID, DELETE_ALERT_ID, FILTER_MODAL_ID].map(id => modals.find(m => m.id === id)?.isOpen ?? false);

    // BEGIN - Customer Deletion
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const handleDelete = (customerId) => {
        setDeleteId(customerId);
        dispatch(actions.modalOpened(DELETE_ALERT_ID));
    };

    const toggleDeleteMode = () => {
        if (isInviteMode) setIsInviteMode(false);
        setIsDeleteMode(!isDeleteMode);
    };
    // END - Customer Deletion

    // BEGIN - Filtering
    const cities = useMemo(() => [...new Set(customers.map(p => p.city))], [customers]);
    const states = useMemo(() => [...new Set(customers.map(p => p.state))], [customers]);
    const zipCodes = useMemo(() => [...new Set(customers.map(p => p.zipCode))], [customers]);
    const referrers = useMemo(() => [...new Set(customers.map(p => p.referrerId))].map(id =>
        ({ displayed: customers.find(c => c.referrerId === id).referrerName, form: id })), [customers]);

    const defaultFilters = { cities, states, zipCodes, referrers };

    const [isFiltered, setIsFiltered] = useState(false);
    const [filters, setFilters] = useState({ ...defaultFilters });

    const displayedCustomers = useMemo(() => (
        isFiltered ? customers.filter(p => {
            if (!filters.cities.includes(p.city)) return false;
            if (!filters.states.includes(p.state)) return false;
            if (!filters.zipCodes.includes(p.zipCode)) return false;
            if (!filters.referrers.find(r => r.form === p.referrerId)) return false;
            return true;
        }) : customers
    ), [filters, isFiltered, customers]);

    useEffect(() => {
        const [source, displayed] = [customers.length, displayedCustomers.length];
        if (displayed !== source) toast.info(`${source - displayed} customers filtered`);
    }, [displayedCustomers, customers]);
    // END - Filtering

    // BEGIN - Invite Creation
    const [isInviteMode, setIsInviteMode] = useState(false);

    const createInvitation = async (customerId) => {
        const res = await dispatch(actions.createInvitation({ customerId, history }));
        if (res?.success) copyToClipboard(res.invitation, "Invitation copied to clipboard");
    };

    const toggleInviteMode = () => {
        if (isDeleteMode) setIsDeleteMode(false);
        setIsInviteMode(!isInviteMode);
    };
    // END - Invite Creation

    return (
        <Fragment>
            <DataTable defaultSrc={displayedCustomers} idAttr="customerId" numericalFields={NUMERICAL_FIELDS} classes="full-width"
                updateFunc={actions.updateCustomer} {...{ isDeleteMode, handleDelete }} isHighlightMode={isInviteMode}
                onClick={({ rowId }) => isInviteMode && createInvitation(rowId)} isClickDisabled={isInviteMode || isDeleteMode}>
                <DataColumn columnName="ID" srcAttr="customerId" type="number" />
                <DataColumn columnName="First Name" srcAttr="firstName" type="text" isEditable />
                <DataColumn columnName="Last Name" srcAttr="lastName" type="text" isEditable />
                <DataColumn columnName="Street" srcAttr="street" type="text" isEditable />
                <DataColumn columnName="City" srcAttr="city" type="text" isEditable />
                <DataColumn columnName="State" srcAttr="state" isEditable />
                <DataColumn columnName="Zip Code" srcAttr="zipCode" type="text" isEditable />
                <DataColumn columnName="Phone" srcAttr="phoneNumber" type="text" isEditable />
                <DataColumn columnName="Referrer" srcAttr="referrerName" name="referrerId" formAttr="customerId" type="text" isEditable isSelect
                    optionsFormula={c => `${c.customerId}: ${c.firstName} ${c.lastName ?? ""}`.trim()} />
            </DataTable>

            <FloatingMenu position="bottom" isHorizontal>
                <CircleButton title="Create Customer" onClick={() => dispatch(actions.modalOpened(CUSTOMER_MODAL_ID))}>
                    <Media.PlusSVG />
                    {isCreatorOpen && <CustomerCreator />}
                </CircleButton>

                <CircleButton title={`${isInviteMode ? "Disable" : "Enable"} Invite Mode`} onClick={toggleInviteMode} isActive={isInviteMode} >
                    <Media.InviteSVG />
                </CircleButton>

                <CircleButton title="Filter Products" onClick={() => dispatch(actions.modalOpened(FILTER_MODAL_ID))} isActive={isFiltered}>
                    <Media.FilterSVG />
                    {isFilterOpen && <FilterModal {...{ defaultFilters, filters, setFilters, setIsFiltered }} />}
                </CircleButton>

                <CircleButton title={`${isDeleteMode ? "Disable" : "Enable"} Delete Mode`} classes="red"
                    onClick={toggleDeleteMode} isActive={isDeleteMode}>
                    <Media.TrashcanSVG />
                    {isDeleteAlertOpen && <DeleteAlert id={DELETE_ALERT_ID} customerId={deleteId} />}
                </CircleButton>
            </FloatingMenu>
        </Fragment>
    );
};

export default Customers;