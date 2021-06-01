import * as types from "store/actions/types";

const initState = [];

const employees = (state = initState, action) => {
    switch (action.type) {
        case types.EMPLOYEE_CREATED: {
            return [...state, action.payload.employee];
        } case types.EMPLOYEE_DELETED: {
            const { id } = action.payload;
            return state.filter(employee => employee.employeeId !== id);
        } case types.EMPLOYEE_UPDATED: {
            const { id, value } = action.payload;
            return state.map(employee => employee.employeeId === id ? { ...employee, ...value } : employee);
        } case types.EMPLOYEES_RETRIEVED: {
            const { employees } = action.payload;
            return employees.length > 0 ? state.concat(employees) : state;
        } case types.RESET: {
            return initState;
        } default: {
            return state;
        }
    }
};

export default employees;