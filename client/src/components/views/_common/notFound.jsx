import React, { useEffect } from "react";
import * as Media from "media";

const NotFound = () => {
    useEffect(() => {document.title = "Page Not Found - Demo"}, []);

    return (
        <div className="notFound">
            <Media.PageNotFoundSVG />
            <div className="subheading">Page Not Found</div>
        </div>
    );
};

export default NotFound;