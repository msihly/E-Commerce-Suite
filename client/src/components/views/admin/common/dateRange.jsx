import React from "react";
import { Input } from "components/form";
import { CURRENT_DATE, PERIOD_START } from ".";
import { getLocalDateTime } from "utils";

const DateRange = ({ endDateName = "endDate", filters, idPrefix = "", startDateName = "startDate", title }) => (
    <div className="date-range">
        {title && <h3 className="full-width text-center">{title}</h3>}
        <div className="row j-center">
            <Input id={`${idPrefix}${idPrefix ? "-" : ""}start-date`} groupClasses="no-mgn no-pad" classes="no-mgn-bottom"
                name={startDateName} type="date" initValue={getLocalDateTime(filters ? filters[startDateName] : PERIOD_START, { type: "date" })} />
            <span className="input-separator">-</span>
            <Input id={`${idPrefix}${idPrefix ? "-" : ""}end-date`} groupClasses="no-mgn no-pad" classes="no-mgn-bottom"
                name={endDateName} type="date" initValue={getLocalDateTime(filters ? filters[endDateName] : CURRENT_DATE, { type: "date" })} />
        </div>
    </div>
);

export default DateRange;