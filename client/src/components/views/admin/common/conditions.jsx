import React from "react";
import { Input } from "components/form";
import { DropSelect } from "components/dropdowns";

const OPERATORS = [">", ">=", "<", "<=", "=", "!="].map(o => ({ displayed: o, form: o }));

const Conditions = ({ conditions, fieldOptions, setConditions }) => {
    const createCondition = () => {
        const id = conditions.length > 0 ? +conditions.slice(-1)[0]?.id + 1 : 0;
        setConditions([...conditions, { id, field: null, operator: null, value: null }]);
    };

    const deleteCondition = (id) => setConditions(conditions.filter(c => c.id !== id));

    return (
        <div className="conditions">
            <h3 className="full-width text-center">Logic Conditions</h3>
            {conditions.length > 0 && conditions.map(c =>
                <ConditionRow key={c.id} id={c.id} fieldOptions={fieldOptions} field={c.field} operator={c.operator} value={+c.value} handleDelete={deleteCondition} />
            )}
            <button onClick={createCondition} className="add-condition">New Condition +</button>
        </div>
    )
};

const ConditionRow = ({ field, fieldOptions, handleDelete, id, operator, value }) => {
    const fieldInitValue = field ? { displayed: fieldOptions.find(f => f.form === field).displayed, form: field } : null;
    const operatorInitValue = operator ? { displayed: operator, form: operator } : null;

    return (
        <div className="condition-row">
            <DropSelect id={`logic-field-${id}`} src={fieldOptions} initValue={fieldInitValue} hasNone={false} />
            <DropSelect id={`logic-operator-${id}`} src={OPERATORS} initValue={operatorInitValue} hasNone={false} />
            <Input id={`logic-value-${id}`} initValue={value ?? null} type="number" />
            <button onClick={() => handleDelete(id)} />
        </div>
    );
};

export default Conditions;