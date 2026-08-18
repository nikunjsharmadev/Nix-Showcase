import { HOTELS } from "../consts/hotel";
import type { Hotel } from "../data/hotel";
export const getHotels = async (): Promise<Hotel[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return HOTELS;
};
