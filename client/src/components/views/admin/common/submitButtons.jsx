import React from "react";

const SubmitButtons = ({ clearFilters, updateFilters }) => (
    <div className="row j-center">
        <button onClick={clearFilters} className="gradient-button red-2-bg">Clear</button>
        <button onClick={updateFilters} className="gradient-button">Filter</button>
    </div>
);

export default SubmitButtons;