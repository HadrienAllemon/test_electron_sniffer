import { useEffect, useRef, useState, useMemo } from "react";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";
import { getItemsSold } from "../../sniffer/sqlite/queries";
import { IItemSold } from "../../interfaces/IItemSold";
import { Summary } from "../summaries/Summary";
import { getChatConfig } from "./getChatConfig";
import { ITransaction } from "../../interfaces";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler
);



type GroupBy = "day" | "week" | "month";
type Aggregated = {
  profit: number;
  sold: number;
  bought: number;
  tax: number;
  date:Date;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" });
  
}

function groupRows(rows: ITransaction[], mode: GroupBy) {
  const map = new Map<string, Aggregated>();

  rows.forEach(({ date, value, type }) => {
    const _date = new Date(date);

    let key: string;
    if (mode === "day") {
      key = formatDate(_date);
    } else if (mode === "week") {
      const d = new Date(_date);
      d.setDate(d.getDate() - d.getDay());
      key = "W of " + formatDate(d);
    } else {
      key = _date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
    }

    if (!map.has(key)) {
      map.set(key, { profit: 0, sold: 0, bought: 0, tax: 0, date : _date });
    }

    const entry = map.get(key)!;

    entry.profit += value;

    if (type === "sold") entry.sold += value;
    else if (type === "bought") entry.bought += value;
    else if (type === "tax") entry.tax += value;
  });

  return {
    labels: [...map.keys()],
    data: [...map.values()].map(v => v.profit),
    meta: [...map.values()], 
    dates: [...map.values()].map(v => v.date)
  };
}

const btnStyle = (active: boolean): React.CSSProperties => ({
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(212,175,55,0.2)",
  background: active
    ? "linear-gradient(180deg, #1e3a5f, #12263f)"
    : "rgba(255,255,255,0.03)",
  color: active ? "#D4AF37" : "rgba(200,210,230,0.6)",
  cursor: "pointer",
  transition: "all 0.2s ease",
});


interface ProfitChartProps {
  transactions: ITransaction[];
  height?: number | string;
  onPointClick?: (from: Date, to: Date) => void;
}

export default function ProfitChart({ height = 280, transactions, onPointClick}: ProfitChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const { labels, data, meta, dates } = useMemo(
    () => groupRows(sortedTransactions, groupBy),
    [transactions, groupBy]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current,getChatConfig(labels, data,groupBy, meta, dates, onPointClick || (() => {})));

    return () => {
      chartRef.current?.destroy();
    };
  }, [labels, data, groupBy]);

  
  return (
    <div className="tabWrapper" style={{ fontFamily: "sans-serif", height:"100%" }}>
      {/* Stat cards */}
      <div className="chartContainer" >

        {/* Group-by buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <span style={{ fontSize: 12, color: "#888" }}>Group by:</span>
          {(["day", "week", "month"] as GroupBy[]).map((g) => (
            <button key={g} style={btnStyle(groupBy === g)} onClick={() => setGroupBy(g)}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div style={{ position: "relative", width: "100%", height}}>
          <canvas ref={canvasRef} />
        </div>

        {/* Legend */}
        <div style={{ marginTop: 8, fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#185FA5", display: "inline-block" }} />
          Profit over time
        </div>
      </div>
    </div>
  );
}
