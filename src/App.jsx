import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import MapSection from "./components/MapSection";
import CoolingSolutions from "./components/CoolingSolutions";
import CityComparison from "./components/CityComparison";
import Analytics from "./components/Analytics";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Navbar />
      <Hero />
      <FeatureCards />
      <MapSection />
      <CoolingSolutions />
      <CityComparison />
      <Analytics />
      <Footer />
    </div>
  );
}
