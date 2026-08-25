interface SearchBarProps {
    filterText: string;
    inStockOnly: boolean;
    onFilterTextChange: (value: string) => void;
    onInStockOnlyChange: (checked: boolean) => void;
}

// SearchBar has NO state of its own. Everything it shows (filterText,
// inStockOnly) comes in through props, and every change it makes goes
// back OUT through props (onFilterTextChange, onInStockOnlyChange).
//
// This is called a "controlled input" - the parent component
// (FilterableProductTable) is the single source of truth for the value,
// not the <input> itself. That's why we set both `value` AND `onChange`
// on the text input below.
export default function SearchBar({
                                      filterText,
                                      inStockOnly,
                                      onFilterTextChange,
                                      onInStockOnlyChange
                                  }: SearchBarProps) {
    return (
        <form className="search-form">
            <div className="field">
                <input
                    className="text-input"
                    type="text"
                    placeholder="Search..."
                    // `value` makes this a controlled input: the box always
                    // shows exactly what's in state, nothing more.
                    value={filterText}
                    // Every keystroke fires this, which calls the setter we
                    // got from the parent - that triggers a re-render there,
                    // which flows the new value back down here as a prop.
                    onChange={(e) => onFilterTextChange(e.target.value)}/>
            </div>
            <label className="checkbox-row">
                <input
                    className="checkbox"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => onInStockOnlyChange(e.target.checked)}
                />
                Only show items in stock
            </label>
        </form>
    );
}
