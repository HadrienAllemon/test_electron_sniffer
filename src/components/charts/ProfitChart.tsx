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


function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupRows(rows: ITransaction[], mode: GroupBy) {
  const map = new Map<string, number>();
  rows.forEach(({ date, value }) => {
    const _date = new Date(date);
    let key: string;
    if (mode === "day") {
      key = formatDate(_date);
    } else if (mode === "week") {
      const d = new Date(_date);
      d.setDate(d.getDate() - d.getDay());
      key = "W of " + formatDate(d);
    } else {
      key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    map.set(key, (map.get(key) ?? 0) + value);
  });
  return { labels: [...map.keys()], data: [...map.values()] };
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
  /** Pass rows directly from your SQLite query result */
  /** Optional height for the chart canvas wrapper (default 280) */
  height?: number|string;
  transactions: ITransaction[];
}

export default function ProfitChart({ height = 280, transactions}: ProfitChartProps) {
  // const [rows, setRows] = useState<IItemSold[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const { labels, data } = useMemo(() => groupRows(sortedTransactions, groupBy), [transactions, groupBy]);

  useEffect(() => {
    // setRows(getItemsSold())
  }, [])

  // Derived stats
  const total = data.reduce((a, b) => a + b, 0);
  const best = data.length ? Math.max(...data) : 0;
  const avg = data.length ? Math.round(total / data.length) : 0;

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current,getChatConfig(labels, data,groupBy));

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
