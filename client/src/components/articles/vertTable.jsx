import React from "react";
import { callOptFunc } from "utils";

const VertTable = ({ children, containerClasses, rightAligned = true, tableClasses }) => {
    const getTableClasses = () => {
        let className = "table-vert";
        if (rightAligned) className += " right";
        if (tableClasses) className += " " + tableClasses;
        return className;
    };

    return (
        <div className={containerClasses ?? null}>
            <table className={getTableClasses()}>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
};

export const VertTableRow = ({ left, leftClasses = null, leftTitle = null, right, rightClasses = null, rightTitle = null, separator = "-" }) => (
    <tr>
        <th className={leftClasses} title={leftTitle}>{callOptFunc(left)}</th>
        <td>{separator}</td>
        <td className={rightClasses} title={rightTitle}>{callOptFunc(right)}</td>
    </tr>
);

export default VertTable;