import { useAtom, useAtomValue } from "jotai"
import { TabIndex } from "../stores/MainStore"
import { ItemsBought } from "./ItemsBought";
import { ItemsSold } from "./ItemsSold";
import { Taxes } from "./Taxes";
import ProfitChart from "../charts/ProfitChart";
import { Transactions } from "./Transactions/Transactions";

export const IndexContent = () =>{
    const tabIndex = useAtomValue(TabIndex);
    const pageToReturn = () => {
        switch(tabIndex){
            case 0:{
                return <Transactions/>
            }
            case 1:{
                return <ItemsSold/>
            }
            case 2:{
                return <ProfitChart/>
            }
        }
    }
    return pageToReturn()
}