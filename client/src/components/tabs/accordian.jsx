import React, { Children, cloneElement, createContext, useState } from "react";

export const AccordianContext = createContext();

const Accordian = ({ children, initValue }) => {
    const [activeExpando, setActiveExpando] = useState(initValue ?? -1);

    return (
        <div className="accordian">
            <AccordianContext.Provider value={{ activeExpando, setActiveExpando }}>
                {Children.map(children, (child, index) => cloneElement(child, { key: index, index }))}
            </AccordianContext.Provider>
        </div>
    );
};

export default Accordian;