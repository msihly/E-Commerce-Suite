import { stringOperators } from "utils";

/* ------------------------------- CONDITIONS ------------------------------- */
export const checkConditions = (conditions, obj) => {
    if (conditions.length > 0) {
        const failedConditions = conditions.filter(c => !stringOperators(c.operator, +obj[c.field], +c.value));
        if (failedConditions.length > 0) return false;
    }
    return true;
};

export const getConditionValues = (inputs) => (
    inputs.filter(i => /logic-field/.test(i.id)).map(field => {
        const id = +field.id.substr(-1, 1);
        return {
            id,
            field: field.value,
            operator: inputs.find(i => i.id === `logic-operator-${id}`).value,
            value: +inputs.find(i => i.id === `logic-value-${id}`).value
        };
    })
);

/* ------------------------------- CHECKBOXES ------------------------------- */
export const getCheckboxValues = (inputs, list, idPrefix) => {
    return list.map(e => inputs.find(i => i.id === `${idPrefix}-${e}`)).filter(e => e.value).map(e => {
        const name = e.id.replace(`${idPrefix}-`, "");
        return name === "null" ? null : name;
    });
};

export const getCheckboxObjValues = (inputs, list, idPrefix) => {
    return list.map(e => inputs.find(i => i.id === `${idPrefix}-${e.form}`)).filter(e => e.value).map(e => {
        const id = +e.id.replace(`${idPrefix}-`, "");
        const form = isNaN(id) ? null : id;
        return { displayed: list.find(l => l.form === form)?.displayed, form };
    });
};