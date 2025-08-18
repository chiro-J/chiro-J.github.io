import Hero from "../components/Hero";
import About from "../components/About";
import TechStacks from "../components/TechStacks";
import Work from "../components/Work";
import Contact from "../components/Contact";

export default function Portfolio() {
  return (
    <section
      id="home"
      className="max-w-screen-md flex items-center min-h-screen px-32 text-white"
    >
      <div className="text-2xl font-bold">
        <Hero />
        <About />
        <TechStacks />
        <Work />
        <Contact />
      </div>
    </section>
  );
}
