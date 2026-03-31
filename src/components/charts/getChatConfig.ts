import { ChartConfiguration } from "chart.js/dist/types";
import { formatPrice } from "../../utils";
type GroupBy = "day" | "week" | "month";
type Aggregated = {
    profit: number;
    sold: number;
    bought: number;
    tax: number;
};

export const getChatConfig = (labels: string[], data: number[], groupBy: GroupBy, meta: Aggregated[], dates:Date[], onPointClick: (from: Date, to: Date) => void): ChartConfiguration<"line", number[], string> => ({
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
        onClick: (evt, elements) => {
            if (!elements.length) return;

            const index = elements[0].index;
            const day = dates[index]

            // reconstruct date range from label
            const from = new Date(day);
            const to = new Date(day);

            to.setHours(23, 59, 59, 999);

            onPointClick?.(from, to);
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(15, 20, 35, 0.95)",
                borderColor: "rgba(77, 245, 197, 0.4)",
                borderWidth: 1,
                padding: 10,
                titleColor: "#4df5c5",
                bodyColor: "#e6edf3",
                displayColors: false,

                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const m = meta[index];

                        const format = (v: number) =>
                            `${v >= 0 ? "+" : ""}${formatPrice(Math.round(v))}`;

                        return [
                            `🟢 Sold: ${format(m.sold)}`,
                            `🔴 Losses: ${format(m.bought)}`,
                            `🟡 Taxes: ${format(m.tax)}`
                        ];
                    },
                    title: function (context) {
                        const index = context[0].dataIndex;
                        const m = meta[index];

                        return `Total: ${Math.round(m.profit)} K`;
                    }
                },
            },
            // tooltip: {
            //     backgroundColor: "rgba(10, 20, 40, 0.95)",
            //     borderColor: "rgba(212,175,55,0.4)",
            //     borderWidth: 1,
            //     padding: 10,
            //     titleColor: "#D4AF37",
            //     bodyColor: "#E5E7EB",
            //     displayColors: false,
            //     callbacks: {
            //         label: (ctx) =>
            //             ` ${ctx.parsed.y.toLocaleString()} K`,
            //     },
            // },
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