import { Routes, Route } from "react-router-dom";
import { HlHome } from "./pages";

export function HlApp() {
  return (
    <Routes>
      <Route path="/" element={<HlHome />} />
      {/* <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> */}
    </Routes>
  );
}
export default HlApp;
