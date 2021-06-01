import React from "react";
import { Accordian, Expando } from "components/tabs";
import { LISTING_SECTIONS } from "components/views/_common";
import { Cards } from "components/cards";

const Sections = ({ cardBase, listings }) => (
    <Accordian>
        {LISTING_SECTIONS.map(section =>
            <Expando key={section.sectionId} text={section.title} imageSrc={section.expandoSrc}>
                <Cards {...{ cardBase }} listings={listings.filter(l => l.sectionId === section.sectionId)} />
            </Expando>
        )}
    </Accordian>
);

export default Sections;