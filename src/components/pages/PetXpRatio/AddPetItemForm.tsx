import { IItemSearchResult } from "@src/sniffer/sqlite/queries";
import { useState, useRef, useEffect } from "react";
import "./AddPetItemForm.css";

export const AddPetItemForm = ({ onAdded }: { onAdded: () => void }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<IItemSearchResult[]>([]);
    const [selected, setSelected] = useState<IItemSearchResult | null>(null);
    const [xp, setXp] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        if (selected) return;
        if (query.length < 3) { setResults([]); return; }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            window.api.searchItems(query).then(setResults).catch(() => setResults([]));
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [query, selected]);

    const handleSelect = (item: IItemSearchResult) => {
        setSelected(item);
        setQuery(item.fr);
        setResults([]);
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        if (selected) setSelected(null);
    };

    const handleSubmit = () => {
        const xpValue = parseFloat(xp.replace(",", "."));
        if (!selected || isNaN(xpValue) || xpValue <= 0) return;
        window.api.addPetItemXp(selected.itemId, xpValue).then(() => {
            setSelected(null);
            setQuery("");
            setXp("");
            onAdded();
        });
    };

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
            <div style={{ position: "relative" }}>
                <input
                    type="text"
                    placeholder="Rechercher un item (min. 3 car.)"
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    style={{ width: 280 }}
                />
                {results.length > 0 && (
                    <ul className="searchResults">
                        {results.map(item => (
                            <li
                                key={item.itemId}
                                onClick={() => handleSelect(item)}
                                className="searchResultsItem"
                            >
                                <div style={{
                                    width: 24, height: 24, flexShrink: 0,
                                    backgroundImage: `url("https://api.dofusdb.fr/img/items/${item.iconId}.png")`,
                                    backgroundSize: "cover",
                                }} />
                                <span>{item.fr}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <input
                type="number"
                placeholder="XP"
                value={xp}
                min={1}
                onChange={e => setXp(e.target.value)}
                style={{ width: 100 }}
            />
            <button onClick={handleSubmit} disabled={!selected || !xp}>
                Ajouter
            </button>
        </div>
    );
};