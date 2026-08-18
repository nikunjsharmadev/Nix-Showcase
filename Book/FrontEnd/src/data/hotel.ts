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
