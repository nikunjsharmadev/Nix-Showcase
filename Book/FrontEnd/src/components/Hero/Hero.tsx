import "./Hero.css";
import { HlBookbar } from "../";
export function HlHero() {
  return (
    <section className="hl-hero">
      <div className="overlay">
        <h1>
          Book smarter
          <br />
          Travel Better
        </h1>
        <p>Find Hotels</p>
        <HlBookbar />
      </div>
    </section>
  );
}
