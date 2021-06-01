import React, { useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import store from "store";
import * as actions from "store/actions";
import { toast } from "react-toastify";
import { Modal } from "components/popovers";
import { Checkbox, Form, ImageInput, Input } from "components/form";
import { DropSelect, makeSelectOption } from "components/dropdowns";
import { getListingSection, LISTING_SECTIONS, STRAINS, WEIGHTS } from "components/views/_common";
import { Card } from "components/cards";
import { EDITOR_MODAL_ID } from "./";

const LISTING_STATE_OPTIONS = ["Draft", "Published", "Archived"].map(e => makeSelectOption(e));

const getRatesFromInputs = (listingRates = []) => {
    const inputs = store.getState().inputs;
    return inputs.filter(i => /listing-quantity/.test(i.id)).map((quantityInput, i) => ({
        listingRateId: listingRates[i]?.listingRateId,
        quantity: quantityInput?.value,
        price: inputs.find(i => i.id === quantityInput?.id.replace("quantity", "price"))?.value
    }));
};

const Editor = ({ listingId }) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const listing = useSelector(state => state.listings.find(l => l.listingId === listingId));

    const products = useSelector(state => state.products);

    const productId = useSelector(state => state.inputs.find(i => i.id === "listing-product"))?.value ?? listing?.productId;
    const product = productId !== undefined ? products.find(p => p.productId === productId) : null;

    const initValues = useMemo(() => listing === undefined ? {
        quantities: WEIGHTS,
        section: makeSelectOption(LISTING_SECTIONS[0].sectionId, `${LISTING_SECTIONS[0].sectionId}: ${LISTING_SECTIONS[0].title}`),
        title: product?.productName,
    } : {
        photo: listing.photoUrl,
        product: makeSelectOption(productId, product?.productName),
        prices: listing.listingRates?.map(rate => rate.price),
        quantities: listing.listingRates?.map(rate => rate.quantity),
        section: makeSelectOption(listing.sectionId, getListingSection(listing.sectionId)?.title),
        state: makeSelectOption(listing.listingState),
        strainType: makeSelectOption(listing.strainType),
        title: listing.title,
    }, [listing]); //eslint-disable-line

    useEffect(() => {
        if (product) dispatch(actions.inputUpdated("listing-title", product.productName));
    }, [dispatch, product]);

    const submitListing = async (formData) => {
        const rates = getRatesFromInputs(listing?.listingRates);
        formData.append("listingRates", JSON.stringify(rates));

        const res = await dispatch(listing ? actions.updateListing({ listingId, formData, history }) : actions.createListing({ formData, history }));
        res?.success ? toast.success(`Successfully ${listing ? "edited" : "created"} listing`) : toast.error(`Error ${listing ? "editing" : "creating"} listing`);

        dispatch(actions.modalClosed(listingId ?? EDITOR_MODAL_ID));
    };

    return (
        <Modal id={listingId ?? EDITOR_MODAL_ID} classes="pad-ctn-1" hasHeader>
            <h2 className="modal-title">{`${listing ? "Edit" : "New"} Listing`}</h2>

            <CardPreview />

            <Form idPrefix="listing" onSubmit={submitListing} classes="column a-center" labelClasses="small glow" submitText="Submit">
                <ImageInput id="photo" inputName="photoUrl" initValue={initValues.photo} style={{ maxWidth: "20rem" }} />

                <div className="row equal-width">
                    <DropSelect id="state" name="listingState" label="Status" hasNone={false} isRequired
                        src={LISTING_STATE_OPTIONS} initValue={initValues.state} />

                    <DropSelect id="section" name="sectionId" label="Section" hasNone={false} isRequired
                        src={LISTING_SECTIONS} srcAttr="sectionId" formula={l => `${l.sectionId}: ${l.title}`} initValue={initValues.section} />
                </div>

                <div className="row equal-width">
                    <DropSelect id="product" name="productId" label="Product" groupClasses="full-width" isRequired
                        src={products} srcAttr="productId" formula={p => `${p.productId}: ${p.productName}`} initValue={initValues.product} />

                    <Input id="title" name="title" label="Title" initValue={initValues.title} groupClasses="full-width" placeholder isRequired />

                    <DropSelect id="strain-type" name="strainType" label="Strain Type"
                        src={STRAINS.map(s => makeSelectOption(s.type))} initValue={initValues.strainType} />
                </div>

                <RateFormRow columns={4} name="quantity" heading="Quantities" initValues={initValues.quantities} />
                <RateFormRow columns={4} name="price" heading="Prices" initValues={initValues.prices} />

                <Checkbox id="has-weights" text="Has Weights" inputName="hasWeights" initValue={true} />
            </Form>
        </Modal>
    );
};

const CardPreview = () => {
    const inputs = useSelector(state => state.inputs);
    const [productId, photoUrl, sectionId, strainType, title] = ["product", "photo", "section", "strain-type", "title"]
        .map(id => inputs.find(i => i.id === `listing-${id}`)?.value || null);

    const product = useSelector(state => state.products.find(p => p.productId === productId));
    const listingRates = getRatesFromInputs();

    return <Card className="preview" {...{ listingRates, photoUrl, product, sectionId, strainType, title }} />;
};

const RateFormRow = ({ columns, heading, initValues, name }) => (<>
    <h4 className="glow">{heading}</h4>
    <div className="row j-center">
        {[...Array(columns)].map((_, i) => <Input key={i} id={`${name}-${i}`} initValue={initValues ? (initValues[i] ?? null) : null}
            type="number" groupClasses="narrow-input" classes="text-center" />)}
    </div>
</>);

export default Editor;