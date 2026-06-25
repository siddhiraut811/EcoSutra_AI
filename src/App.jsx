import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import SearchBar from "./components/SearchBar";
import MapSection from "./components/MapSection";
import CoolingSolutions from "./components/CoolingSolutions";
import CityComparison from "./components/CityComparison";
import CarbonCalculator from "./components/CarbonCalculator";
import Analytics from "./components/Analytics";
import Footer from "./components/Footer";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCoords, setSearchCoords] = useState(null);

  const handleSearch = (query, coords) => {
    setSearchQuery(query);
    setSearchCoords(coords);
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Navbar />
      <Hero />
      <FeatureCards />
      <SearchBar onSearch={handleSearch} searchQuery={searchQuery} />
      <MapSection searchCoords={searchCoords} searchQuery={searchQuery} />
      <CoolingSolutions />
      <CityComparison searchQuery={searchQuery} />
      <CarbonCalculator />
      <Analytics />
      <Footer />
    </div>
  );
}
