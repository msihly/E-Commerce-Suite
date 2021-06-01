import React from "react";
import { useSelector } from "react-redux";
import { Sections } from "components/views/_common";
import { Card } from ".";

const Catalog = () => {
    const listings = useSelector(state => state.listings).filter(l => l.listingState === "Published");

    return <Sections cardBase={<Card />} {...{ listings }} />;
};

export default Catalog;