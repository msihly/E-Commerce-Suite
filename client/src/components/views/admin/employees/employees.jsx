import React, { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { CircleButton, FloatingMenu } from "components/popovers";
import { DataColumn, DataTable } from "components/dataTable";
import { DeleteAlert, EmployeeCreator, DELETE_ALERT_ID, EMPLOYEE_MODAL_ID } from "./";
import * as Media from "media";

const NUMERICAL_FIELDS = ["employeeId"];

const Employees = () => {
    const dispatch = useDispatch();

    const employees = useSelector(state => state.employees);

    const modals = useSelector(state => state.modals);
    const [isCreatorOpen, isDeleteAlertOpen] = [EMPLOYEE_MODAL_ID, DELETE_ALERT_ID].map(id => modals.find(m => m.id === id)?.isOpen ?? false);

    // BEGIN - Employee Deletion
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const handleDelete = (employeeId) => {
        setDeleteId(employeeId);
        dispatch(actions.modalOpened(DELETE_ALERT_ID));
    };
    // END - Employee Deletion

    return (
        <Fragment>
            <DataTable defaultSrc={employees} idAttr="employeeId" updateFunc={actions.updateEmployee} handleDelete={handleDelete}
                isDeleteMode={isDeleteMode} numericalFields={NUMERICAL_FIELDS} classes="full-width">
                <DataColumn columnName="ID" srcAttr="employeeId" type="number" />
                <DataColumn columnName="First Name" srcAttr="firstName" type="text" isEditable />
                <DataColumn columnName="Last Name" srcAttr="lastName" type="text" isEditable />
                <DataColumn columnName="Phone" srcAttr="phoneNumber" type="text" isEditable />
            </DataTable>

            <FloatingMenu position="bottom" isHorizontal>
                <CircleButton title="Create Employee" onClick={() => dispatch(actions.modalOpened(EMPLOYEE_MODAL_ID))}>
                    <Media.PlusSVG />
                    {isCreatorOpen && <EmployeeCreator />}
                </CircleButton>

                <CircleButton title={`${isDeleteMode ? "Disable" : "Enable"} Delete Mode`} classes="red"
                    onClick={() => setIsDeleteMode(!isDeleteMode)} isActive={isDeleteMode}>
                    <Media.TrashcanSVG />
                    {isDeleteAlertOpen && <DeleteAlert id={DELETE_ALERT_ID} employeeId={deleteId} />}
                </CircleButton>
            </FloatingMenu>
        </Fragment>
    );
};

export default Employees;