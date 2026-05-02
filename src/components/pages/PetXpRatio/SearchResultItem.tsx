import { IItemSearchResult } from "@src/sniffer/sqlite/queries";


interface SearchResultItemProps {
    item: IItemSearchResult;
    query: string;
    tracked: boolean;
    onSelect: (item: IItemSearchResult) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
    item,
    query,
    tracked,
    onSelect,
}) => {
    const highlightMatch = (text: string) => {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, "gi");
        return text.split(regex).map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="highlight">{part}</span>
                : part
        );
    };

    return (
        <li
            onClick={() => onSelect(item)}
            className={"searchResultsItem" + (tracked ? " tracked" : "")}
        >
            <div className="itemHeader">
                <div className="itemInfo">
                    <div className="itemName">
                        {highlightMatch(item.name)}
                        {tracked && <span className="alreadyTracked">✔</span>}
                    </div>
                    <div className="itemLvl">Niveau {item.level}</div>
                </div>

                <div
                    className="itemIcon"
                    style={{
                        backgroundImage: `url("https://api.dofusdb.fr/img/items/${item.iconId}.png")`,
                    }}
                />
            </div>
        </li>
    );
};