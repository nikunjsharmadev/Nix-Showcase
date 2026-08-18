import "./Search.css";
import { useState } from "react";
import { debouncefn } from "../../utils/utils";
import { HlGrid } from "../";

export function HlSearch() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceSearch = debouncefn((searchString: string) => {
    setSearch(searchString);
  });
  return (
    <section className="hl-search">
      <input
        type="text"
        name="search-input"
        placeholder="Search hotels or city"
        className="search-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          debounceSearch(e.target.value);
        }}
      />
      <HlGrid
        props={{
          searchString: search,
        }}
      />
    </section>
  );
}
