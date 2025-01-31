import ReactDOM from 'react-dom/client'
import { ButtonTest } from './components/ButtonTest'
import { ItemTable } from './components/tables/ItemTable'
import { ItemsBought } from './components/pages/ItemsBought'
import { TopTabs } from './components/topTabs/TopTabs'
import { ChakraProvider } from '@chakra-ui/react'
ReactDOM.createRoot(document.getElementById('root')!).render(
    <ChakraProvider>
        <div style={{ height: "100%", display:"flex", flexDirection:"column" }}>
            {/* <ButtonTest /> */}
            <TopTabs />
            <ItemsBought />
        </div>
    </ChakraProvider>
)