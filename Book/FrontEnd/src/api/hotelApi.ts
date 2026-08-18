import { HOTELS } from "../consts/hotel";
export const getHotels = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return HOTELS;
};
