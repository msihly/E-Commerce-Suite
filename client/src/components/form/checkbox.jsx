import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { FormContext } from "components/form";
import * as Media from "media";

const Checkbox = ({ classes, handleClick, id, initValue = false, inputName = null, option, text }) => {
    const context = useContext(FormContext);
    id = context?.idPrefix ? `${context.idPrefix}-${id}` : id;

    const dispatch = useDispatch();

    const isChecked = useSelector(state => state.inputs.find(input => input.id === id))?.value ?? initValue;

    useEffect(() => {
        dispatch(actions.inputCreated(id, initValue));

        return () => dispatch(actions.inputDeleted(id));
    }, [dispatch, id, initValue]);

    const getClasses = () => {
        let className = "checkbox-ctn";
        if (isChecked) className += " checked";
        if (classes) className += " " + classes;
        return className;
    };

    const toggleCheckbox = () => {
        dispatch(actions.inputUpdated(id, !isChecked));
        handleClick?.(option ?? !isChecked);
    };

    return (
        <label className={getClasses()}>
            <input type="checkbox" name={inputName} onClick={toggleCheckbox} checked={isChecked} readOnly />
            <span className="checkbox">{isChecked ? <Media.CheckmarkSVG /> : null}</span>
            {text && <label className="lb-title checkbox-title">{text}</label>}
        </label>
    );
};

export default Checkbox;