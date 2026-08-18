import "./Card.css";
import { Link } from "react-router-dom";
import type { HlCardProps } from "../../data/hotel";
export function HlCard({ props }: HlCardProps) {
  const { hotel } = props;
  return (
    <section className="hl-card">
      <img src={hotel.image} alt={hotel.name} />
      <section className="info">
        <h3>{hotel.name}</h3>
        <p className="city">{hotel.city}</p>
        <p className="desc">{hotel.description}</p>
        <section className="bottom">
          <span className="price">{hotel.price}/night</span>
          <span className="rating">⭐ {hotel.rating}</span>
        </section>
        <Link to={`/hotel/${hotel.id}`} className="btn">
          View Details
        </Link>
      </section>
    </section>
  );
}
