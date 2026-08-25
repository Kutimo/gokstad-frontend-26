interface SearchBarProps {
    filterText: string;
    inStockOnly: boolean;
    onFilterTextChange: (value: string) => void;
    onInStockOnlyChange: (checked: boolean) => void;
}

export default function SearchBar({
                                      filterText,
                                      inStockOnly,
                                      onFilterTextChange,
                                      onInStockOnlyChange
                                  }: SearchBarProps) {
    return (
        <form>
            <input
                type="text"
                placeholder="Search..."
                value={filterText}
                onChange={(e) => onFilterTextChange(e.target.value)}/>
            <label>
                <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => onInStockOnlyChange(e.target.checked)}
                />
                Only show items in stock.
            </label>
        </form>
    );
}
