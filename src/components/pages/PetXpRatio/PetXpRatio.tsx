import { useEffect, useRef, useState } from "react";
import { ItemTable } from "../../tables/ItemTable";
import { ColDef } from "ag-grid-community";
import { IPetItemXpRatio, IItemSearchResult } from "../../../sniffer/sqlite/queries";
import { formatPrice } from "../../../utils";
import { AddPetItemForm } from "./AddPetItemForm";

const formatRatio = (value: number | null) =>
    value == null ? "—" : value.toFixed(3);

const colDefs: ColDef<IPetItemXpRatio>[] = [
    {
        field: "iconId",
        sortable: false,
        headerName: "",
        flex: .2,
        cellClass: "cellImg",
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) =>
            <div className="tableImg" style={{ backgroundImage: `url("https://api.dofusdb.fr/img/items/${data.iconId}.png")` }} />,
    },
    { field: "name", headerName: "Ressource", flex: 3 },
    { field: "xp", headerName: "XP", flex: 1 },
    {
        field: "by1",
        headerName: "Prix",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) =>
            [data.by1, data.by10, data.by100, data.by1000]
                .map(d => d != null ? formatPrice(d) : "—")
                .join(" / "),
    },
    {
        field: "xpPerKama_by1",
        headerName: "XP/K ×1",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => formatRatio(data.xpPerKama_by1),
    },
    {
        field: "xpPerKama_by10",
        headerName: "XP/K ×10",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => formatRatio(data.xpPerKama_by10),
    },
    {
        field: "xpPerKama_by100",
        headerName: "XP/K ×100",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => formatRatio(data.xpPerKama_by100),
    },
    {
        field: "xpPerKama_by1000",
        headerName: "XP/K ×1000",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => formatRatio(data.xpPerKama_by1000),
    },
];



export const PetXpRatio = () => {
    const [rows, setRows] = useState<IPetItemXpRatio[]>([]);

    const fetchData = () => {
        window.api.getPetItemXpRatios()
            .then(setRows)
            .catch(() => setRows([]));
    };

    useEffect(() => {
        fetchData();
        window.api.onPricesUpdated(fetchData);
    }, []);

    return (
        <div className="tabWrapper">
            <div className="filterRow kamaBgBackground">
                <AddPetItemForm onAdded={fetchData} />
                <button onClick={fetchData}>Actualiser</button>
            </div>
            <div style={{ flex: 9 }}>
                <ItemTable data={rows} colDefs={colDefs} />
            </div>
        </div>
    );
};
