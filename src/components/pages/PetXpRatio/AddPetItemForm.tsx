import { IItemSearchResult } from "@src/sniffer/sqlite/queries";
import { useState, useRef, useEffect, useMemo } from "react";
import "./AddPetItemForm.css";
import { SearchResultItem } from "./SearchResultItem";

interface AddPetItemFormProps {
    onAdded: () => void;
    idList: number[];
}

export const AddPetItemForm: React.FC<AddPetItemFormProps> = ({ onAdded, idList }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<IItemSearchResult[]>([]);
    const [selected, setSelected] = useState<IItemSearchResult | null>(null);
    const [xp, setXp] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
    const trackedIds = useMemo(() => new Set(idList), [idList]);

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
        setQuery(item.name);
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
        <div className="formWrapper" style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
            <div className="formControls" style={{ position: "relative" }}>
                <input
                    type="text"
                    placeholder="Rechercher un item (min. 3 car.)"
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    className="searchInput"
                />
                {results.length > 0 && (
                    <ul className="searchResults">
                        {results.map(item => (
                            <SearchResultItem
                                key={item.itemId}
                                item={item}
                                query={query}
                                tracked={trackedIds.has(item.itemId)}
                                onSelect={handleSelect}
                            />
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
                className="xpInput"
            />
            <button onClick={handleSubmit} disabled={!selected || !xp}>
                Ajouter
            </button>
        </div>
    );
};