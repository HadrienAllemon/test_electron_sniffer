import { useAtomValue } from "jotai"
import { TabIndex } from "../stores/MainStore"
import { ItemsSold } from "./ItemsSold";
import { PetXpRatio } from "./PetXpRatio/PetXpRatio";
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
                return <PetXpRatio/>
            }
        }
    }
    return pageToReturn()
}