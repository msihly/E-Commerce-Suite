import React, { Fragment, useContext } from "react";
import { AnimateHeight } from "components/wrappers";
import { AccordianContext } from "./";

const Expando = ({ children, imageSrc, index, onClick, text }) => {
    const { activeExpando, setActiveExpando } = useContext(AccordianContext);

    const handleClick = () => {
        onClick?.();
        setActiveExpando(activeExpando === index ? -1 : index);
    };

    return (
        <Fragment>
            <div onClick={handleClick} className="expando">
                <img src={imageSrc} alt="" />
                <span>{text}</span>
            </div>
            {activeExpando === index && <AnimateHeight>{children}</AnimateHeight>}
        </Fragment>
    );
};

export default Expando;