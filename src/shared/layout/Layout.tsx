import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-64px)] px-4 py-28">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
