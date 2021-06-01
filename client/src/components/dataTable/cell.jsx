import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Input } from "components/form";
import { DropSelect } from "components/dropdowns";
import { formatData, getLocalDateTime } from "utils";

const DataCell = ({
    classes,
    columnName,
    formAttr,
    formula,
    hasColorScale,
    id,
    idAttr,
    isClickDisabled = false,
    isEditable = false,
    isSelect = false,
    name,
    onClick,
    optionsFormula,
    row,
    src,
    srcAttr,
    suggAttr,
    suggSrc,
    subIdAttr,
    type,
    updateFunc,
}) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);

    const getClasses = () => {
        let className = isEditing ? "input-cell" : "";
        if (classes) className += ` ${classes}`;
        if (["currency", "date", "number", "text"].includes(type)) className += ` td-${type}`;
        if (hasColorScale) {
            const value = getData();
            if (value < 0) className += " negative";
            if (value > 0) className += " positive";
        }
        return className.trim();
    };

    const getData = (forSelect = false) => {
        const expression = formula?.(row, src) ?? row[srcAttr];
        const formValue = row[name ?? srcAttr];

        if (forSelect) return { displayed: expression, form: type === "date" ? getLocalDateTime(formValue, { type: "date" }) : formValue };
        if (type === "date") return expression ? getLocalDateTime(expression, { type: "date" }) : null;
        return typeof expression === "string" ? expression.trim() : expression;
    };

    const handleBlur = event => event.relatedTarget === null && setIsEditing(false);

    const handleClick = () => {
        if (isClickDisabled) return;
        if (onClick) onClick({ row, rowId: row[idAttr], value: row[srcAttr] });
        if (isEditable && !isEditing) setIsEditing(true);
    };

    const handleSubmit = async (formData) => {
        const res = await dispatch(updateFunc({ id: row[idAttr], subId: row[subIdAttr], formData, history }));
        if (res?.success) setIsEditing(false);
    };

    const renderEditor = () => {
        let inputProps = {
            formula,
            hasInitFocus: true,
            id,
            initValue: getData(isSelect),
            name: name ?? srcAttr,
            src,
            srcAttr,
        };

        if (isSelect) {
            inputProps.formAttr = formAttr;
            inputProps.formula = optionsFormula ?? formula;
            inputProps.handleSelect = (formObj) => {
                const formData = new FormData();
                formData.append(formObj.name, formObj.value);
                handleSubmit(formData);
            };
            inputProps.onClose = () => setIsEditing(false);
        } else if (type === "date") {
            inputProps.type = "date";
            inputProps.onChange = value => {
                const formData = new FormData();
                formData.append(name ?? srcAttr, value);
                handleSubmit(formData);
            };
        } else {
            inputProps.suggSrc = suggSrc ?? src;
            inputProps.suggAttr = suggAttr ?? srcAttr;
            if (type === "number" || type === "currency") inputProps.type = "number";
            else inputProps.type = "text";
        }

        return isSelect ? <DropSelect {...inputProps} /> : <Input {...inputProps} />;
    };

    return (
        <td className={getClasses()} onClick={handleClick} onBlur={handleBlur}>
            {isEditing
                ? <Form onSubmit={handleSubmit}>{renderEditor()}</Form>
                : <span title={`${columnName}: ${getData()}`}>{formatData(getData(), type)}</span>}
        </td>
    );
};

export default DataCell;