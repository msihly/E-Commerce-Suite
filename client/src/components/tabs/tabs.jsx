import React, { Children, cloneElement, createContext, useContext, useEffect, useState } from "react";
import { ConditionalWrap, SideScroller } from "components/wrappers";

export const TabContext = createContext();

export const Tab = ({ index, label }) => {
    const { activeTab, setActiveTab } = useContext(TabContext);

    return (
        <div onClick={() => setActiveTab(index)} className={`tab-button${activeTab === index ? " active" : ""}`}>
            {label}
        </div>
    );
};

export const Tabs = ({ children, containerClasses, hasScrollPlaceholder, initTab, isChips, isColumnar, tabClasses, tabContainerClasses }) => {
    const [activeTab, setActiveTab] = useState(0);

    const activeChild = Children.toArray(children)[activeTab]?.props ?? null;

    useEffect(() => { if (initTab !== undefined && initTab !== null) setActiveTab(initTab); }, [initTab]);

    const wrapInScroller = children => (
        <SideScroller classes={tabContainerClasses} hasPlaceholder={hasScrollPlaceholder}>
            {children}
        </SideScroller>
    );

    // BEGIN - Classes
    const getContainerClasses = () => {
        let className = `tab-container${isColumnar ? " row" : " column"}`;
        if (containerClasses) className += ` ${containerClasses}`;
        return className.trim();
    };

    const getTabClasses = () => {
        let className = "tab-content";
        if (tabClasses) className += ` ${tabClasses}`;
        if (activeChild.className) className += ` ${activeChild.className}`;
        return className.trim();
    };

    const getTabButtonClasses = () => {
        let className = `tab-buttons ${isColumnar ? "column" : "row"}`;
        if (!isColumnar && tabContainerClasses) className += ` ${tabContainerClasses}`;
        if (isChips) className += ` chips`;
        return className.trim();
    };
    // END - Classes

    return (
        <div className={getContainerClasses()}>
            <ConditionalWrap condition={!isColumnar} wrap={c => wrapInScroller(c)}>
                <div className={getTabButtonClasses()}>
                    <TabContext.Provider value={{ activeTab, setActiveTab }}>
                        {Children.map(children, (child, index) => cloneElement(child, { key: index, index: child.props?.index ?? index }))}
                    </TabContext.Provider>
                </div>
            </ConditionalWrap>

            <div className={getTabClasses()}>
                {activeChild?.children}
            </div>
        </div>
    );
};