import React, { cloneElement } from "react";

const NavButton = ({ icon, iconClasses, id, isActive = false, onClick, switchView, text }) => {
    const getIconClasses = () => `nav-btn-icon ${iconClasses ?? ""}`.trim();

    const handleClick = () => {
        onClick?.();
        switchView(id);
    };

    return (
        <div onClick={handleClick} className={`nav-btn${isActive ? " active" : ""}`}>
            {icon && (typeof icon === "string" ?
                <img src={icon} className={getIconClasses()} alt="" />
                : cloneElement(icon, { className: getIconClasses() }))}
            {text && <div className="nav-btn-text">{text}</div>}
        </div>
    );
};

export default NavButton;