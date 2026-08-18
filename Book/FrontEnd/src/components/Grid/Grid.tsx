import "./Grid.css";
import { useQuery } from "@tanstack/react-query";
import type { HlGridProps, Hotel } from "../../data/hotel";
import { getHotels } from "../../Services/Services";
import { HlCard } from "../";
export function HlGrid({ props }: HlGridProps) {
  const { searchString } = props;
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({ queryKey: ["Hotels"], queryFn: getHotels });
  const filterHotels: Hotel[] = data.filter(
    (hotel: Hotel) =>
      hotel.name.toLowerCase().includes(searchString.toLowerCase()) ||
      hotel.name.toLowerCase().includes(searchString.toLowerCase()),
  );
  return (
    <>
      <section className="hl-grid">
        <section className="section-hotels">
          {filterHotels.map((hotel: Hotel) => (
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
