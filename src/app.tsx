import ReactDOM from 'react-dom/client'
import { TopTabs } from './components/topTabs/TopTabs'
import { ChakraProvider } from '@chakra-ui/react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { IndexContent } from './components/pages/IndexContent'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
ReactDOM.createRoot(document.getElementById('root')!).render(
    <ChakraProvider>
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "1500px", margin:"0 auto" }}>
                <TopTabs />
                <IndexContent />
            </div>
    </ChakraProvider>
)