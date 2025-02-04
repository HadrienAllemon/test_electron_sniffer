import { useAtom, useAtomValue } from "jotai"
import { TabIndex } from "../stores/MainStore"
import { ItemsBought } from "./ItemsBought";
import { ItemsSold } from "./ItemsSold";
import { Taxes } from "./Taxes";

export const IndexContent = () =>{
    const tabIndex = useAtomValue(TabIndex);
    const pageToReturn = () => {
        switch(tabIndex){
            case 0:{
                return <ItemsBought/>
            }
            case 1:{
                return <ItemsSold/>
            }
            case 2:{
                return <Taxes/>
            }
        }
    }
    return pageToReturn()
}