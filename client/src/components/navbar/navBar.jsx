import React, { Children, cloneElement } from "react";

const NavBar = ({ activeView, children, position = "top", switchView }) => (
    <nav className={`navbar ${position}`}>
        {children && Children.map(children, (child, index) => cloneElement(child, {
            key: index,
            id: index,
            isActive: index === activeView,
            switchView,
        } ))}
    </nav>
);

export default NavBar;