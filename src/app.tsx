import ReactDOM from 'react-dom/client'
import { ButtonTest } from './components/ButtonTest'
import { ItemTable } from './components/tables/ItemTable'
import { ItemsBought } from './components/pages/ItemsBought'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <div style={{height:"100%"}}>
        {/* <ItemsBought/> */}
        <ButtonTest />
    </div>
)