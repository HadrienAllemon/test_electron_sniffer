import { Tabs, TabList, Tab, TabPanels, TabPanel, Box, Button, useMultiStyleConfig, useTab } from "@chakra-ui/react"
import React, { Ref } from "react"


const CustomTab = React.forwardRef((props: any, ref: Ref<HTMLElement>) => {
    const tabProps = useTab({ ...props, ref })
    const isSelected = !!tabProps['aria-selected']

    // 2. Hook into the Tabs `size`, `variant`, props
    const styles = useMultiStyleConfig('Tabs', tabProps)

    return (
        <Button __css={{ ...styles.tab }} {...tabProps} className={"tabButton " + (isSelected ? "selected" : "")} >
            {/* <Box as='span' mr='2'>
                {isSelected ? '😎' : '😐'}
            </Box> */}
            {tabProps.children}
            {isSelected ? <div className="tabGlider" /> : <div className="placdeHodlerGlider" />}
        </Button>
    )
})


export const TopTabs = () => {
    return (
        <Tabs>
            <TabList style={{ borderBottom: 0, justifyContent: "space-around" }}>
                <CustomTab>Items Bought</CustomTab>
                <CustomTab>Items Sold</CustomTab>
                <CustomTab>Taxes</CustomTab>
            </TabList>
            {/* <TabPanels>
                <TabPanel>1</TabPanel>
                <TabPanel>2</TabPanel>
            </TabPanels> */}
        </Tabs>
    )
}