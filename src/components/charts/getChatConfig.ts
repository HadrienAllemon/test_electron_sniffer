import { ChartConfiguration } from "chart.js/dist/types";
type GroupBy = "day" | "week" | "month";

export const getChatConfig = (labels:string[],data:number[], groupBy:GroupBy):ChartConfiguration<"line", number[], string>  => ({
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