import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useState } from "react";
const queryClient = new QueryClient();

// INTERFACES
export interface Hotel {
  id: number;
  name: string;
  city: string;
  price: number;
  rating: number;
  image: string;
  description: string;
}
export interface HlCardProps {
  props: {
    hotel: Hotel;
  };
}
export interface HlGridProps {
  props: {
    searchString: string;
  };
}
// --------------------------------------------------------
// CONSTS
export const HOTELS: Hotel[] = [
  {
    id: 1,
    name: "Hilton Downtown",
    city: "Toronto",
    price: 180,
    rating: 4.8,
    image: "https://picsum.photos/400/300?random=1",
    description: "Luxury hotel in the heart of downtown.",
  },
  {
    id: 2,
    name: "Sea View Resort",
    city: "Miami",
    price: 220,
    rating: 4.7,
    image: "https://picsum.photos/400/300?random=2",
    description: "Beachfront resort with ocean views.",
  },
  {
    id: 3,
    name: "Mountain Lodge",
    city: "Denver",
    price: 150,
    rating: 4.5,
    image: "https://picsum.photos/400/300?random=3",
    description: "Quiet mountain retreat.",
  },
  {
    id: 4,
    name: "City Central Inn",
    city: "New York",
    price: 200,
    rating: 4.6,
    image: "https://picsum.photos/400/300?random=4",
    description: "Modern hotel near Times Square.",
  },
  {
    id: 5,
    name: "Sunrise Suites",
    city: "Vancouver",
    price: 175,
    rating: 4.4,
    image: "https://picsum.photos/400/300?random=5",
    description: "Comfortable stay with mountain views.",
  },
  {
    id: 6,
    name: "Royal Palace Hotel",
    city: "London",
    price: 280,
    rating: 4.9,
    image: "https://picsum.photos/400/300?random=6",
    description: "Elegant luxury hotel.",
  },
  {
    id: 7,
    name: "Skyline Residency",
    city: "Chicago",
    price: 195,
    rating: 4.5,
    image: "https://picsum.photos/400/300?random=7",
    description: "City skyline from every room.",
  },
  {
    id: 8,
    name: "Ocean Breeze Hotel",
    city: "Los Angeles",
    price: 240,
    rating: 4.7,
    image: "https://picsum.photos/400/300?random=8",
    description: "Relax near the beach.",
  },
  {
    id: 9,
    name: "Maple Stay",
    city: "Montreal",
    price: 165,
    rating: 4.3,
    image: "https://picsum.photos/400/300?random=9",
    description: "Cozy hotel in old town.",
  },
  {
    id: 10,
    name: "Desert Pearl",
    city: "Phoenix",
    price: 155,
    rating: 4.4,
    image: "https://picsum.photos/400/300?random=10",
    description: "Peaceful desert experience.",
  },
  {
    id: 11,
    name: "Golden Crown",
    city: "Dubai",
    price: 350,
    rating: 5.0,
    image: "https://picsum.photos/400/300?random=11",
    description: "Luxury experience with skyline views.",
  },
  {
    id: 12,
    name: "Riverfront Hotel",
    city: "Calgary",
    price: 170,
    rating: 4.5,
    image: "https://picsum.photos/400/300?random=12",
    description: "Beautiful riverside property.",
  },
  {
    id: 13,
    name: "Park Avenue Inn",
    city: "Boston",
    price: 210,
    rating: 4.6,
    image: "https://picsum.photos/400/300?random=13",
    description: "Business hotel near downtown.",
  },
  {
    id: 14,
    name: "Lakeside Resort",
    city: "Seattle",
    price: 225,
    rating: 4.8,
    image: "https://picsum.photos/400/300?random=14",
    description: "Scenic lakefront accommodation.",
  },
  {
    id: 15,
    name: "Blue Horizon",
    city: "San Diego",
    price: 215,
    rating: 4.7,
    image: "https://picsum.photos/400/300?random=15",
    description: "Luxury beachside hotel.",
  },
  {
    id: 16,
    name: "Harbor View",
    city: "San Francisco",
    price: 310,
    rating: 4.9,
    image: "https://picsum.photos/400/300?random=16",
    description: "Views of the Golden Gate.",
  },
  {
    id: 17,
    name: "Comfort Haven",
    city: "Ottawa",
    price: 160,
    rating: 4.4,
    image: "https://picsum.photos/400/300?random=17",
    description: "Family-friendly accommodation.",
  },
  {
    id: 18,
    name: "Elite Grand",
    city: "Paris",
    price: 330,
    rating: 4.9,
    image: "https://picsum.photos/400/300?random=18",
    description: "Luxury in the heart of Paris.",
  },
  {
    id: 19,
    name: "Snow Peak Lodge",
    city: "Banff",
    price: 260,
    rating: 4.8,
    image: "https://picsum.photos/400/300?random=19",
    description: "Perfect mountain getaway.",
  },
  {
    id: 20,
    name: "Emerald Hotel",
    city: "Dublin",
    price: 205,
    rating: 4.6,
    image: "https://picsum.photos/400/300?random=20",
    description: "Classic European comfort.",
  },
  {
    id: 21,
    name: "Palm Resort",
    city: "Cancun",
    price: 275,
    rating: 4.8,
    image: "https://picsum.photos/400/300?random=21",
    description: "All-inclusive beachfront resort.",
  },
  {
    id: 22,
    name: "Urban Loft",
    city: "Berlin",
    price: 190,
    rating: 4.5,
    image: "https://picsum.photos/400/300?random=22",
    description: "Stylish city accommodation.",
  },
  {
    id: 23,
    name: "Aurora Inn",
    city: "Reykjavik",
    price: 295,
    rating: 4.8,
    image: "https://picsum.photos/400/300?random=23",
    description: "Northern lights experience.",
  },
  {
    id: 24,
    name: "Imperial Stay",
    city: "Tokyo",
    price: 315,
    rating: 4.9,
    image: "https://picsum.photos/400/300?random=24",
    description: "Modern hotel with premium amenities.",
  },
  {
    id: 25,
    name: "Harbor Suites",
    city: "Sydney",
    price: 280,
    rating: 4.7,
    image: "https://picsum.photos/400/300?random=25",
    description: "Harbor-facing luxury suites.",
  },
  {
    id: 26,
    name: "Grand Heritage",
    city: "Rome",
    price: 255,
    rating: 4.8,
    image: "https://picsum.photos/400/300?random=26",
    description: "Historic charm with modern comfort.",
  },
  {
    id: 27,
    name: "Green Valley Resort",
    city: "Zurich",
    price: 290,
    rating: 4.9,
    image: "https://picsum.photos/400/300?random=27",
    description: "Nature-inspired luxury.",
  },
  {
    id: 28,
    name: "Crystal Bay",
    city: "Singapore",
    price: 300,
    rating: 4.8,
    image: "https://picsum.photos/400/300?random=28",
    description: "Premium stay in the city center.",
  },
  {
    id: 29,
    name: "Sunset Retreat",
    city: "Goa",
    price: 145,
    rating: 4.4,
    image: "https://picsum.photos/400/300?random=29",
    description: "Relaxing beach vacation.",
  },
  {
    id: 30,
    name: "Sky Palace",
    city: "Hong Kong",
    price: 320,
    rating: 4.9,
    image: "https://picsum.photos/400/300?random=30",
    description: "Luxury rooms with panoramic skyline views.",
  },
];
// -------------------------------------------------------------
// UTILS
export const debouncefn = <T extends (...args: any[]) => void>(
  fn: T,
  delay = 500,
) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
// ------------------------------------------------------------
// SERVICES
export const getHotels = async (): Promise<Hotel[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return HOTELS;
};
// -------------------------------------------------------------
// COMPONENTS
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

export function HlGrid({ props }: HlGridProps) {
  const { searchString } = props;
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({ queryKey: ["Hotels"], queryFn: getHotels });
  const filterHotels = data.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchString.toLowerCase()) ||
      hotel.name.toLowerCase().includes(searchString.toLowerCase()),
  );
  return (
    <>
      <section className="hl-grid">
        <section className="section-hotels">
          {filterHotels.map((hotel) => (
            <HlCard key={hotel.id} props={{ hotel }} />
          ))}
        </section>
        <div className="empty-state">
          {!isLoading && filterHotels.length < 1 && (
            <>
              <h2>No Hotel Found</h2>
              <p>
                Try searching with a different keyword, then "
                <strong>{searchString}</strong>".
              </p>
            </>
          )}
          {isLoading && `Loading...`}
          {isError && `No Hotels available at this time, try again later`}
        </div>
      </section>
    </>
  );
}

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

export function HlBookbar() {
  return (
    <form className="hl-search-bar" onSubmit={(e) => e.preventDefault()}>
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

export function HlHome() {
  return (
    <>
      <HlNavbar />
      <HlHero />
      <HlSearch />
    </>
  );
}

export function HlApp() {
  return (
    <Routes>
      <Route path="/" element={<HlHome />} />
      {/* <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> */}
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <HlApp />
    </BrowserRouter>
  </QueryClientProvider>,
);
