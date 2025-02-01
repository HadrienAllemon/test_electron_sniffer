interface SummaryProps {
    total: number;
    title: string;
}

const numberWithSpances = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const Summary: React.FC<SummaryProps> = ({ total, title }) => {
    return (
        <div className="summaryWrapper">
            <span style={{ color: "white", position: "absolute", top: "0", left: "5px" }}> {title} </span>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "95%", alignItems: "center" }}>
                <div style={{ fontSize: "30px", fontWeight:"bold", color:"rgb(255 210 34)" }} >{numberWithSpances(total)}</div>
                <div className="kamaIcon" />
            </div>
        </div>
    )
}