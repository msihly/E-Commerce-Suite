import React from "react";
import { Checkbox } from "components/form";

const Checkboxes = ({ defaultList, idPrefix, isCentered, isObjList = false, liveList, title }) => (
    <div>
        <h3 className="full-width text-center">{title}</h3>
        <div className={`checkboxes${isCentered ? " centered" : ""}`}>
            {isObjList
                ? defaultList.map(e => <Checkbox key={e.form} id={`${idPrefix}-${e.form}`} inputName={e.form} text={e.displayed} initValue={!(liveList.findIndex(l => l.form === e.form) === -1)} />)
                : defaultList.map(e => <Checkbox key={e} id={`${idPrefix}-${e}`} inputName={e} text={e ?? "None"} initValue={liveList.includes(e)} />)
            }
        </div>
    </div>
);

export default Checkboxes;