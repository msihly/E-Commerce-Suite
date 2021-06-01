import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { DropSelect } from "components/dropdowns";
import { Modal } from "components/popovers";
import { Form, Input } from "components/form";
import { EXPENSE_MODAL_ID } from "./";
import { getLocalDateTime } from "utils";

const ExpenseCreator = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const employees = useSelector(state => state.employees);

    const handleSubmit = async (formData) => {
        const res = await dispatch(actions.createExpense({ formData, history }));
        if (!res?.success) return toast.error("Error adding expense");
    };

    return (
        <Modal id={EXPENSE_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">New Expense</h2>
            <Form idPrefix="expense" onSubmit={handleSubmit} labelClasses="small glow" submitText="Submit">
                <div className="row equal-width">
                    <Input id="type" name="expenseType" label="Type" placeholder isRequired />
                    <Input id="description" name="expenseDescription" label="Description" placeholder />
                    <Input id="amount" name="expenseAmount" label="Amount" placeholder isRequired />
                    <Input id="status" name="expenseStatus" label="Status" placeholder />
                </div>

                <div className="row equal-width">
                    <Input id="date-incurred" name="dateIncurred" label="Date Incurred" type="date" initValue={getLocalDateTime(null, { type: "date" })} placeholder isRequired />
                    <Input id="date-paid" name="datePaid" label="Date Paid" type="date" placeholder />
                    <DropSelect id="payee" name="payeeId" label="Payee" src={employees} formAttr="employeeId"
                        formula={e => `${e.employeeId}: ${e.firstName} ${e?.lastName ?? ""}`.trim()} />
                </div>
            </Form>
        </Modal>
    );
};

export default ExpenseCreator;