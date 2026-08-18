import "./Bookbar.css";
export function HlBookbar() {
  return (
    <form className="hl-book-bar" onSubmit={(e) => e.preventDefault()}>
      <input type="text" name="destination" placeholder="Destination" />
      <input type="date" name="from" />
      <input type="date" name="to" />
      <select name="type">
        <option>1 Guest</option>
        <option>2 Guest</option>
        <option>Family</option>
      </select>
    </form>
  );
}
