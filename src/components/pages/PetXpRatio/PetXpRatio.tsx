import { useEffect, useRef, useState } from "react";
import { ItemTable } from "../../tables/ItemTable";
import { ColDef } from "ag-grid-community";
import { IPetItemXpRatio, IItemSearchResult } from "../../../sniffer/sqlite/queries";
import { formatPrice } from "../../../utils";
import { AddPetItemForm } from "./AddPetItemForm";

const formatRatio = (value: number | null) =>
    value == null ? "—" : value.toFixed(3);

const getColor = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();

    const hour = 1000 * 60 * 60;
    const h48 = 48 * hour;
    const h168 = 7 * 24 * hour;

    let hue;

    if (diffMs <= h48) {
        // 0h → 48h : green → orange
        const ratio = diffMs / h48; // 0 → 1
        hue = 120 - (90 * ratio);  // 120 → 30
    } else {
        // 48h → 7d : orange → red
        const ratio = Math.min((diffMs - h48) / (h168 - h48), 1); // 0 → 1
        hue = 30 - (30 * ratio); // 30 → 0
    }

    return `hsl(${hue}, 70%, 50%)`;
};

const getLastUpdate = (date: Date) => {
    if (date == null) return "—";
    const dateStr = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

    return <div style={{ color: getColor(date) }}>{dateStr}</div>;
}
const TOTAL_XP = 179592;

function formatBestRatio(data: IPetItemXpRatio) {
    const options = [
        { size: 1, ratio: data.xpPerKama_by1 },
        { size: 10, ratio: data.xpPerKama_by10 },
        { size: 100, ratio: data.xpPerKama_by100 },
        { size: 1000, ratio: data.xpPerKama_by1000 },
    ].filter(o => o.ratio != null);
    if (options.length === 0) return "—";

    return "By " + options.sort((a, b) => b.ratio - a.ratio)[0].size;
}

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
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => (
            <div>
                <div>{formatRatio(data.xpPerKama_by1)}</div>
                <div>{179592 / data.xpPerKama_by1}</div>
            </div>
        )
    },
    {
        field: "xpPerKama_by10",
        headerName: "XP/K ×10",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => (
            <div>
                <div>{formatRatio(data.xpPerKama_by10)}</div>
                <div>{179592 / data.xpPerKama_by10}</div>
            </div>
        )
    },
    {
        field: "xpPerKama_by100",
        headerName: "XP/K ×100",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => (
            <div>
                <div>{formatRatio(data.xpPerKama_by100)}</div>
                <div>{179592 / data.xpPerKama_by100}</div>
            </div>
        )
    },
    {
        field: "xpPerKama_by1000",
        headerName: "XP/K ×1000",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => (
            <div>
                <div>By {formatRatio(data.xpPerKama_by1000)}</div>
                <div>{179592 / data.xpPerKama_by1000}</div>
            </div>
        )
    },
    {
        field: "created_at",
        headerName: "Dernière maj.",
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => getLastUpdate(data.created_at),
    },
    {
        field: "bestXpRatio",
        headerName: "Best Ratio",
        autoHeight: true,
        flex: 2,
        cellRenderer: ({ data }: { data: IPetItemXpRatio }) => {
            return (
                <div>
                    <div style={{ fontWeight: "bold" }}>{formatBestRatio(data)}</div>
                    <div>{formatPrice(TOTAL_XP / data.bestXpRatio)}</div>
                </div >
            )
        }
    }
];



export const PetXpRatio = () => {
    const [rows, setRows] = useState<IPetItemXpRatio[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

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
                <button onClick={() => setShowAddForm((prev) => !prev)}>+ Ajouter</button>
                <button onClick={fetchData}>Actualiser</button>
                <AddPetItemForm show={showAddForm} idList={rows.map(d => d.itemId)} onAdded={fetchData} />
            </div>
            <div style={{ flex: 9 }}>
                <ItemTable data={rows} colDefs={colDefs} />
            </div>
        </div>
    );
};
