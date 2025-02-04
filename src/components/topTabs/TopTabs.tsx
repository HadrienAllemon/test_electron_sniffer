import { Tabs, TabList, Tab, TabPanels, TabPanel, Box, Button, useMultiStyleConfig, useTab } from "@chakra-ui/react"
import { useSetAtom } from "jotai"
import React, { Ref } from "react"
import { TabIndex } from "../stores/MainStore";


const CustomTab = React.forwardRef((props: any, ref: Ref<HTMLElement>) => {
    const setTabIndex = useSetAtom(TabIndex);
    const tabProps = useTab({ ...props, ref })
    const isSelected = !!tabProps['aria-selected']

    // 2. Hook into the Tabs `size`, `variant`, props
    const styles = useMultiStyleConfig('Tabs', tabProps)

    return (
        <Button __css={{ ...styles.tab }} {...tabProps} className={"tabButton " + (isSelected ? "selected" : "")} onClick={() => setTabIndex(props.index)} >
            {tabProps.children}
            {isSelected ? <div className="tabGlider" /> : <div className="placdeHodlerGlider" />}
        </Button>
    )
})


export const TopTabs = () => {
    return (
        <Tabs>
            <TabList style={{ borderBottom: 0, justifyContent: "space-around" }}>
                <CustomTab index={0}>Items Bought</CustomTab>
                <CustomTab index={1}>Items Sold</CustomTab>
                <CustomTab index={2}>Taxes</CustomTab>
            </TabList>
            {/* <TabPanels>
                <TabPanel>1</TabPanel>
                <TabPanel>2</TabPanel>
            </TabPanels> */}
        </Tabs>
    )
}