import { Summary } from "../summaries/Summary";
import { ItemTable } from "../tables/ItemTable"
import { dummyData } from './dummyData';

export const ItemsBought = () => {
    const total = dummyData.reduce((a: number, b: any) => a + b.price, 0)
    return (
        <div style={{ padding: "20px", height: "100%", boxSizing: "border-box", width: "100%", display: "flex", flexDirection: "column" }} >
            <div style={{ display: "flex", justifyContent: "space-around", gap: "20px", flex: 1 }} >
                <Summary title="total (7 derniers jours)" total={total} />
                <Summary title="total (7 derniers jours)" total={total} />
                <Summary title="total (7 derniers jours)" total={total} />
            </div>
            <div style={{flex:9}}>
                <ItemTable data={dummyData} />
            </div>
        </div>
    )
}