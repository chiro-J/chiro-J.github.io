import Hero from "../components/Hero";
import About from "../components/About";
import TechStacks from "../components/TechStacks";
import Work from "../components/Work";
import Contact from "../components/Contact";

export default function Portfolio() {
  return (
    <>
      <section id="home" className="py-8">
        <div className="text-2xl font-bold text-white">
          <Hero />
        </div>
      </section>
      <section id="About" className="py-8">
        <div className="text-2xl font-bold text-white">
          <About />
        </div>
      </section>

      <section id="TechStacks" className="py-8">
        <div className="text-2xl font-bold text-white">
          <TechStacks />
        </div>
      </section>

      <section id="Work" className="py-8">
        <div className="text-2xl font-bold text-white">
          <Work />
        </div>
      </section>

      <section id="Contact" className="py-8">
        <div className="text-2xl font-bold text-white">
          <Contact />
        </div>
      </section>
    </>
  );
}
