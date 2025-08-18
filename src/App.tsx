import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./shared/layout/Layout";
import Portfolio from "./pages/Portfolio";
import Guestbook from "./pages/Guestbook";
import Galaxy from "./shared/Backgrounds/Galaxy";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{ width: "100%", height: "100%", position: "fixed", zIndex: -1 }}
      >
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={0.5}
          glowIntensity={0.2}
          saturation={0.2}
          hueShift={240}
        />
      </div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Portfolio />} />
          <Route path="guestbook" element={<Guestbook />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
