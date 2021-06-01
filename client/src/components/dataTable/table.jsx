import React, { Children, createContext, useMemo, useState } from "react";
import { DataCell } from "./";
import { callOptFunc, generateRandomString, sortArray } from "utils";

export const DataTableContext = createContext();

const DataTable = ({
    activeRow,
    children,
    classes,
    defaultSrc,
    handleDelete,
    idAttr,
    isClickDisabled,
    isDeleteMode,
    isHighlightMode,
    numericalFields = [],
    onClick,
    outerClasses = "",
    subIdAttr,
    updateFunc
}) => {
    const [sortKey, setSortKey] = useState(idAttr);
    const [sortDir, setSortDir] = useState("desc");

    const src = useMemo(() =>
        sortArray(defaultSrc, sortKey, sortDir === "desc", numericalFields.includes(sortKey))
    , [defaultSrc, sortKey, sortDir, numericalFields]);

    const handleClick = (row) => {
        if (isDeleteMode) return handleDelete?.(row[subIdAttr ?? idAttr]);
        if (onClick) onClick?.({ row, rowId: row[subIdAttr ?? idAttr] });
    };

    const rows = useMemo(() => {
        return src?.length ? (
            src.map((row, index) => (
                <tr key={index} className={row[idAttr] === activeRow ? "highlighted" : null} onClick={() => handleClick(row)}>
                    {Children.map(children, ({ props }) => {
                        const r = row?.length ? row[0] : row;
                        const id = `${r[idAttr]}${subIdAttr ? `-${r[subIdAttr]}` : ""}-${props.columnName}-${generateRandomString()}`;

                        return <DataCell {...props}
                            key={id}
                            id={id}
                            idAttr={idAttr}
                            subIdAttr={subIdAttr}
                            row={r}
                            src={callOptFunc(props?.src, r) ?? src}
                            suggSrc={callOptFunc(props?.suggSrc, r)}
                            isClickDisabled={isClickDisabled || isDeleteMode}
                            updateFunc={props?.updateFunc ?? updateFunc} />;
                    })}
                </tr>
            ))
        ) : <tr><td colSpan="20">No data</td></tr>;
    }, [activeRow, children, isClickDisabled, isDeleteMode, src]); //eslint-disable-line

    const getTableClasses = () => {
        let className = "data-table";
        if (classes) className += " " + classes;
        if (isDeleteMode) className += " delete-mode";
        if (isHighlightMode) className += " highlight-mode";
        return className;
    };

    return (
        <div className={`scroll-h ${outerClasses}`.trim()}>
            <table className={getTableClasses()}>
                <DataTableContext.Provider value={{ sortKey, sortDir, setSortKey, setSortDir }}>
                    <thead><tr>{children}</tr></thead>
                </DataTableContext.Provider>
                <tbody>{rows}</tbody>
            </table>
        </div>
    );
};

export default DataTable;