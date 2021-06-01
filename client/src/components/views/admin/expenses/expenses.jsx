import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { CircleButton, FloatingMenu } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { CURRENT_DATE, PERIOD_START } from "../common";
import { DeleteAlert, ExpenseCreator, FilterModal, DELETE_ALERT_ID, EXPENSE_MODAL_ID, FILTER_MODAL_ID } from "./";
import { dateInRange, stringOperators } from "utils";
import * as Media from "media";

const NUMERICAL_FIELDS = ["expenseId", "expenseAmount", "payeeId"];

const Expenses = () => {
    const dispatch = useDispatch();

    const employees = useSelector(state => state.employees);
    const expenses = useSelector(state => state.expenses);

    const modals = useSelector(state => state.modals);
    const [isCreatorOpen, isDeleteAlertOpen, isFilterOpen] = [EXPENSE_MODAL_ID, DELETE_ALERT_ID, FILTER_MODAL_ID]
        .map(id => modals.find(m => m.id === id)?.isOpen ?? false);

    // BEGIN - Expense Deletion
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const handleDelete = (employeeId) => {
        setDeleteId(employeeId);
        dispatch(actions.modalOpened(DELETE_ALERT_ID));
    };
    // END - Expense Deletion

    // BEGIN - Filtering
    const types = useMemo(() => [...new Set(expenses.map(e => e.expenseType))], [expenses]);
    const statuses = useMemo(() => [...new Set(expenses.map(e => e.expenseStatus))], [expenses]);
    const payees = useMemo(() => [...new Set(expenses.map(e => e.payeeId))].map(id => ({ displayed: expenses.find(e => e.payeeId === id)?.payeeName, form: id })), [expenses]);

    const defaultFilters = {
        incurredStartDate: PERIOD_START,
        incurredEndDate: CURRENT_DATE,
        paidStartDate: PERIOD_START,
        paidEndDate: CURRENT_DATE,
        types,
        statuses,
        payees,
        conditions: []
    };

    const [isFiltered, setIsFiltered] = useState(false);
    const [filters, setFilters] = useState({ ...defaultFilters });

    const displayedExpenses = useMemo(() => (
        isFiltered ? expenses.filter(e => {
            if (!dateInRange(e.dateIncurred, filters.incurredStartDate, filters.incurredEndDate)) return false;
            if (e.datePaid !== null && !dateInRange(e.datePaid, filters.paidStartDate, filters.paidEndDate)) return false;
            if (!filters.types.includes(e.expenseType)) return false;
            if (!filters.statuses.includes(e.expenseStatus)) return false;
            if (!filters.payees.find(p => p.form === e.payeeId)) return false;
            if (filters.conditions.length > 0) {
                const failedConditions = filters.conditions.filter(c => !stringOperators(c.operator, +e[c.field], +c.value));
                if (failedConditions.length > 0) return false;
            }
            return true;
        }) : expenses
    ), [filters, isFiltered, expenses]);

    useEffect(() => {
        const [source, displayed] = [expenses.length, displayedExpenses.length];
        if (displayed !== source) toast.info(`${source - displayed} expenses filtered`);
    }, [displayedExpenses, expenses]);
    // END - Filtering

    return (
        <Fragment>
            <DataTable defaultSrc={displayedExpenses} idAttr="expenseId" updateFunc={actions.updateExpense} handleDelete={handleDelete}
                isDeleteMode={isDeleteMode} numericalFields={NUMERICAL_FIELDS} classes="full-width">
                <DataColumn columnName="ID" srcAttr="expenseId" type="number" />
                <DataColumn columnName="Type" srcAttr="expenseType" type="text" isEditable />
                <DataColumn columnName="Description" srcAttr="expenseDescription" type="text" isEditable />
                <DataColumn columnName="Amount" srcAttr="expenseAmount" type="currency" isEditable />
                <DataColumn columnName="Status" srcAttr="expenseStatus" type="text" isEditable />
                <DataColumn columnName="Date Incurred" srcAttr="dateIncurred" type="date" isEditable />
                <DataColumn columnName="Date Paid" srcAttr="datePaid" type="date" isEditable />
                <DataColumn columnName="Payee" srcAttr="payeeName" name="payeeId" formAttr="employeeId" type="text" isEditable isSelect
                    src={employees} optionsFormula={e => `${e.employeeId}: ${e.firstName} ${e?.lastName ?? ""}`.trim()} />
            </DataTable>

            <FloatingMenu position="bottom" isHorizontal>
                <CircleButton title="Create Expense" onClick={() => dispatch(actions.modalOpened(EXPENSE_MODAL_ID))}>
                    <Media.PlusSVG />
                    {isCreatorOpen && <ExpenseCreator />}
                </CircleButton>

                <CircleButton title="Filter Expenses" onClick={() => dispatch(actions.modalOpened(FILTER_MODAL_ID))} isActive={isFiltered}>
                    <Media.FilterSVG />
                    {isFilterOpen && <FilterModal {...{ defaultFilters, filters, setFilters, setIsFiltered }} />}
                </CircleButton>

                <CircleButton title={`${isDeleteMode ? "Disable" : "Enable"} Delete Mode`} classes="red"
                    onClick={() => setIsDeleteMode(!isDeleteMode)} isActive={isDeleteMode}>
                    <Media.TrashcanSVG />
                    {isDeleteAlertOpen && <DeleteAlert id={DELETE_ALERT_ID} expenseId={deleteId} />}
                </CircleButton>
            </FloatingMenu>
        </Fragment>
    );
};

export default Expenses;