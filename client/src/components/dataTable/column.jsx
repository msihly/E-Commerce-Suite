import React, { useContext } from "react";
import { DataTableContext } from "components/dataTable";

const DataColumn = ({ columnName, name, sortKey, srcAttr }) => {
    const context = useContext(DataTableContext);

    const attr = sortKey ?? name ?? srcAttr;

    return (
        <th className={context.sortKey === attr ? `sort-${context.sortDir}` : null} onClick={() => {
            context.setSortDir(context.sortKey === attr ? (context.sortDir === "desc" ? "asc" : "desc") : "desc");
            if (context.sortKey !== attr) context.setSortKey(attr);
        }}>{columnName}</th>
    );
};

export default DataColumn;