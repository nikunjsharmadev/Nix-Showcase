import "./Navbar.css";
import { Link } from "react-router-dom";
export function HlNavbar() {
  return (
    <nav className="hl-navbar">
      <div className="logo">TripFinder</div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/">Hotels</Link>
        </li>
        <li>
          <Link to="">Flights</Link>
        </li>
        <li>
          <Link to="/Profile">User</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
}
