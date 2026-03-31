import { useEffect, useMemo, useState } from "react";
import { Summary } from "../../summaries/Summary";
import { ItemTable } from "../../tables/ItemTable"
import { ColDef } from 'ag-grid-community';
import { dateDiff } from "../../../utils/DateFunctions";
import { getTransactions } from "../../../sniffer/sqlite/queries";
import { ITransaction } from "../../../interfaces";
import "./Transactions.css";
import ProfitChart from "../../charts/ProfitChart";
import { formatPrice } from "../../../utils";

interface TableItem {
    data: ITransaction
}

type Filters = {
    from?: Date;
    to?: Date;
    type: "all" | "sold" | "bought" | "tax";
    search: string;
};

const sortDate = (valueA: any, valueB: any) => {
    // @ts-ignore
    return new Date(valueA) - new Date(valueB);
}

const taxTypeToStringFr = (type: string) => {
    switch (type) {
        case "sold": return "Vente";
        case "bought": return "Achat";
        case "tax": return "Taxe";
        default: return type;
    }
}




export const Transactions = () => {
    const [colDefs, setColDefs] = useState<ColDef<any>[]>([
        {
            field: "",
            sortable: false,
            headerName: "",
            flex: .2,
            cellClass: "cellImg",
            cellRenderer: (item: TableItem) => <div className="tableImg" style={{ backgroundImage: `url("https://api.dofusdb.fr/img/items/${item.data.iconId}.png")` }} />
        },
        { field: "name", headerName: "Nom", flex: 3 },
        { field: "type", headerName: "type", flex: 3, cellRenderer: (item: TableItem) => <div>{taxTypeToStringFr(item.data.type)}</div> },
        {
            field: "value",
            headerName: "Prix",
            flex: 3,
            cellRenderer: (item: TableItem) => <div className={`transactionPrice ${item.data.value > 0 ? 'positive' : 'negative'} `}>{formatPrice(item.data.value)}</div>
        },
        { field: "amount", headerName: "Nombre", flex: 3 },
        {
            field: "date",
            headerName: "Date",
            flex: 3,
            cellRenderer: (item: TableItem) => <div>{new Date(item.data.date).toLocaleDateString("fr-fr", DateOptions)}</div>, comparator: sortDate
        }
    ]);
    const [Transactions, setTransactions] = useState<ITransaction[]>([]);
    const [filters, setFilters] = useState<Filters>({
        type: "all",
        from: null,
        to: null,
        search: "",
    });
    const [viewMode, setViewMode] = useState<"table" | "chart">("table");

    const handleFilterChange = (key: keyof Filters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const setDateRange = (from: Date, to: Date) => {
        setFilters(prev => ({
            ...prev,
            from,
            to
        }));
    };

    const handleDateRangeChange = (range: string) => {
        const now = new Date();
        if (range === "last7") {
            handleFilterChange("from", new Date(now.setDate(now.getDate() - 7)));
            handleFilterChange("to", new Date());
        } else if (range === "last30") {
            handleFilterChange("from", new Date(now.setDate(now.getDate() - 30)));
            handleFilterChange("to", new Date());
        } else {
            handleFilterChange("from", null);
            handleFilterChange("to", null);
        }
    };

    useEffect(() => {
        setTransactions(getTransactions());
    }, []);


    const filteredTransactions = useMemo(() => {
        return Transactions.filter((t) => {
            if (filters.type !== "all" && t.type !== filters.type) return false;

            if (filters.from && t.date < filters.from) return false;
            if (filters.to && t.date > filters.to) return false;

            if (
                filters.search &&
                !t.name.toLowerCase().includes(filters.search.toLowerCase())
            ) {
                return false;
            }

            return true;
        });
    }, [Transactions, filters]);

    var DateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };


    if (!Transactions || !Transactions.length) return null;
    const total7Days = Transactions
        .filter(item => dateDiff(new Date(), new Date(item.date)) < 7)
        .reduce((a: number, b: any) => a + b.value, 0);
    const total31Days = Transactions
        .filter(item => dateDiff(new Date(), new Date(item.date)) < 31)
        .reduce((a: number, b: any) => a + b.value, 0);
    const total = Transactions.reduce((a: number, b: any) => a + b.value, 0)
    return (
        <div className="tabWrapper" >
            <div className="filterRow kamaBgBackground">
                <select onChange={(e) => handleDateRangeChange(e.target.value)}>
                    <option value="all">All time</option>
                    <option value="last7">Last 7 days</option>
                    <option value="last30">Last 30 days</option>
                    <option value="custom">Custom</option>
                </select>
                <select onChange={(e) => handleFilterChange("type", e.target.value)}>
                    <option value="all">All</option>
                    <option value="sold">Sold</option>
                    <option value="bought">Bought</option>
                    <option value="tax">Tax</option>
                </select>
                <input
                    type="text"
                    placeholder="Search by name or tax"
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                />
                <button onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}>
                    {viewMode === "table" ? "📊 Chart" : "📋 Table"}
                </button>
            </div>
            <div className="summaryRow" >
                <Summary title="total (7 derniers jours)" total={total7Days} />
                <Summary title="total (31 derniers jours)" total={total31Days} />
                <Summary title="total (tous les temps)" total={total} />
            </div>
            <div style={{ flex: 9 }}>
                {viewMode === "table" ? (
                    <ItemTable data={filteredTransactions} colDefs={colDefs} />
                ) : (
                    <ProfitChart
                    transactions={filteredTransactions}
                    height={"50vh"}
                    onPointClick={(from, to) => {
                        setDateRange(from, to);
                        setViewMode("table");
                    }}
                  />
                )}
            </div>
        </div>
    )
}