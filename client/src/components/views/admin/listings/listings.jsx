import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { CircleButton, FloatingMenu } from "components/popovers";
import { Tab, Tabs } from "components/tabs";
import { Sections } from "components/views/_common";
import { Card, Editor, EDITOR_MODAL_ID } from "./";
import { sortArray } from "utils";
import * as Media from "media";

const Listings = () => {
    const dispatch = useDispatch();

    const listings = useSelector(state => state.listings);

    const isItemModalOpen = useSelector(state => state.modals.find(m => m.id === EDITOR_MODAL_ID))?.isOpen ?? false;

    return (
        <Fragment>
            <Tabs tabClasses="center" isChips>
                <Tab label="Published">
                    <Sections cardBase={<Card />} listings={listings.filter(l => l.listingState === "Published")} />
                </Tab>

                <Tab label="Drafts">
                    <Sections cardBase={<Card />} listings={listings.filter(l => l.listingState === "Draft")} />
                </Tab>

                <Tab label="Archived">
                    <Sections cardBase={<Card />} listings={sortArray(listings, "dateAdded").filter(l => l.listingState === "Archived")} hasSort={false} />
                </Tab>
            </Tabs>

            <FloatingMenu position="bottom" isHorizontal>
                <CircleButton title="Add Listing" onClick={() => dispatch(actions.modalOpened(EDITOR_MODAL_ID))}>
                    <Media.PlusSVG />
                    {isItemModalOpen && <Editor />}
                </CircleButton>
            </FloatingMenu>
        </Fragment>
    );
};



export default Listings;