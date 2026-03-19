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
import { ItemSoldRow } from "../types/ItemSold";
import { Summary } from "../summaries/Summary";

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

function groupRows(rows: ItemSoldRow[], mode: GroupBy) {
  const map = new Map<string, number>();
  rows.forEach(({ created_at, profit }) => {
    const date = new Date(created_at);
    let key: string;
    if (mode === "day") {
      key = formatDate(date);
    } else if (mode === "week") {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay());
      key = "W of " + formatDate(d);
    } else {
      key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    map.set(key, (map.get(key) ?? 0) + profit);
  });
  return { labels: [...map.keys()], data: [...map.values()] };
}


interface ProfitChartProps {
  /** Pass rows directly from your SQLite query result */
  /** Optional height for the chart canvas wrapper (default 280) */
  height?: number;
}

export default function ProfitChart({ height = 280 }: ProfitChartProps) {
  const [rows, setRows] = useState<ItemSoldRow[]>([]);
  console.log(rows);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");

  const { labels, data } = useMemo(() => groupRows(rows, groupBy), [rows, groupBy]);

  useEffect(() => {
    setRows(getItemsSold())
  }, [])

  // Derived stats
  const total = data.reduce((a, b) => a + b, 0);
  const best = data.length ? Math.max(...data) : 0;
  const avg = data.length ? Math.round(total / data.length) : 0;

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      plugins: [
        {
          id: "glow",
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.shadowColor = "rgba(212,175,55,0.6)";
            ctx.shadowBlur = 12;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
          },
          afterDraw: (chart) => {
            chart.ctx.restore();
          },
        },
      ],
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Profit",
            data,
            borderColor: "#D4AF37", // gold
            borderWidth: 2,
            tension: 0.4,
    
            pointRadius: groupBy === "day" ? 2 : 3,
            pointHoverRadius: 6,
            pointBackgroundColor: "#D4AF37",
            pointBorderWidth: 0,
    
            fill: true,
            backgroundColor: (ctx) => {
              const chart = ctx.chart;
              const { ctx: canvasCtx, chartArea } = chart;
              if (!chartArea) return "rgba(212,175,55,0.1)";
    
              const gradient = canvasCtx.createLinearGradient(
                0,
                chartArea.top,
                0,
                chartArea.bottom
              );
              gradient.addColorStop(0, "rgba(212,175,55,0.25)");
              gradient.addColorStop(1, "rgba(212,175,55,0.02)");
              return gradient;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: { display: false },
    
          tooltip: {
            backgroundColor: "rgba(10, 20, 40, 0.95)",
            borderColor: "rgba(212,175,55,0.4)",
            borderWidth: 1,
            padding: 10,
            titleColor: "#D4AF37",
            bodyColor: "#E5E7EB",
            displayColors: false,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.parsed.y.toLocaleString()} K`,
            },
          },
        },

        
    
        scales: {
          x: {
            ticks: {
              color: "rgba(200, 210, 230, 0.6)",
              maxTicksLimit: 10,
              font: { size: 11 },
            },
            grid: {
              color: "rgba(255,255,255,0.04)",
              
            },
          },
          y: {
            ticks: {
              color: "rgba(200, 210, 230, 0.6)",
              font: { size: 11 },
              callback: (v) => Number(v).toLocaleString(),
            },
            grid: {
              color: "rgba(255,255,255,0.04)",
              // drawBorder: false,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [labels, data, groupBy]);

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

  return (
    <div className="tabWrapper" style={{ fontFamily: "sans-serif" }}>
      {/* Stat cards */}
      <div className="summaryRow">
        {/* <StatCard label="Total profit" value={total.toLocaleString()} />
        <StatCard label="Best period" value={best.toLocaleString()} />
        <StatCard label="Avg per period" value={avg.toLocaleString()} /> */}
        <Summary title="Total profit" total={total} />
        <Summary title="Best period" total={best} />
        <Summary title="Avg per period" total={avg} />

      </div>
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
        <div style={{ position: "relative", width: "100%", height }}>
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
