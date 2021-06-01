
import * as Media from "media";

export { default as Account } from "./account";
export { default as AuthRoute } from "./authRoute";
export { default as Loading } from "./loading";
export { default as NotFound } from "./notFound";
export { default as Sections } from "./listingSections";

export const LISTING_SECTIONS = [
    {
        sectionId: 1,
        title: "Flowers",
        expandoSrc: Media.FlowerExpando,
        thumbSrc: Media.FlowerThumb,
    }, {
        sectionId: 2,
        title: "Trees",
        expandoSrc: Media.TreesExpando,
        thumbSrc: Media.TreesThumb,
    }, {
        sectionId: 3,
        title: "Vegetables",
        expandoSrc: Media.VegetablesExpando,
        thumbSrc: Media.VegetablesThumb,
    }, {
        sectionId: 4,
        title: "Tools",
        expandoSrc: Media.ToolsExpando,
        thumbSrc: Media.ToolsThumb,
    }
];

export const STRAINS = [
    { type: "Annual", className: "green-2" },
    { type: "Perennial", className: "orange-2" },
    { type: "Biennial", className: "purple-3" },
];

export const WEIGHTS = [2, 4, 8, 16];

export const getListingSection = (sectionId) => LISTING_SECTIONS.find(l => l.sectionId === sectionId);

export const getStrainClass = (strainType) => STRAINS.find(s => s.type === strainType)?.className;