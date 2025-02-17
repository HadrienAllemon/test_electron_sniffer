import { useEffect, useState } from "react";
import { Summary } from "../summaries/Summary";
import { ItemTable } from "../tables/ItemTable"
import { ipcRenderer } from "electron";
import { ColDef } from 'ag-grid-community';
import { dateDiff } from "../../utils/DateFunctions";



export const ItemsBought = () => {

    const sortDate = (valueA: any, valueB: any) => {
        // @ts-ignore
        return new Date(valueA) - new Date(valueB);
    }
    var DateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };
    const [colDefs, setColDefs] = useState<ColDef<any>[]>([
        {
            field: "",
            sortable: false,
            headerName: "",
            flex: .2,
            cellClass: "cellImg",
            cellRenderer: (item: any) => <div className="tableImg" style={{ backgroundImage: `url("https://api.dofusdb.fr/img/items/${item.data.iconId}.png")` }} />
        },
        { field: "fr", headerName: "Nom", flex: 3 },
        { field: "price", headerName: "Prix", flex: 3 },
        { field: "amountBought", headerName: "Nombre Acheté", flex: 3 },
        { field: "created_at", headerName: "Date", flex: 3, cellRenderer: (item: any) => <div>{new Date(item.data.created_at).toLocaleDateString("fr-fr", DateOptions)}</div>, comparator: sortDate }
    ]);
    const [ItemsBought, setItemsBought] = useState<any[] | undefined>(undefined)
    async function queryItemsBought() {
        const capInstance = await ipcRenderer.invoke('getItemsBought', { /* args */ });
        return capInstance
    }
    useEffect(() => {
        queryItemsBought().then((response) => {
            setItemsBought(response)
        }).catch((error) => {
            console.error(error);
            setItemsBought([])
        })
    }, []);

    if (!ItemsBought || !ItemsBought.length) return null;
    const total7Days = ItemsBought
        .filter(item => dateDiff(new Date(), new Date(item.created_at)) < 7)
        .reduce((a: number, b: any) => a + b.price, 0);
    const total31Days = ItemsBought
        .filter(item => dateDiff(new Date(), new Date(item.created_at)) < 31)
        .reduce((a: number, b: any) => a + b.price, 0);
    const total = ItemsBought.reduce((a: number, b: any) => a + b.price, 0)
    return (
        <div style={{ padding: "20px", height: "100%", boxSizing: "border-box", width: "100%", display: "flex", flexDirection: "column" }} >
            <div style={{ display: "flex", justifyContent: "space-around", gap: "20px", flex: 1 }} >
                <Summary title="total (7 derniers jours)" total={total7Days} />
                <Summary title="total (31 derniers jours)" total={total31Days} />
                <Summary title="total (tous les temps)" total={total} />
            </div>
            <div style={{ flex: 9 }}>
                <ItemTable data={ItemsBought} colDefs={colDefs} />
            </div>
        </div>
    )
}