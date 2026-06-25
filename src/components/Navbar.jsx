export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 border-b border-orange-900/30">
      <span className="text-3xl font-bold text-orange-400">
        EcoSutra AI
      </span>

      <div className="flex gap-6 text-gray-300 text-sm">
        <a href="#hero"       className="hover:text-orange-400 transition-colors">Home</a>
        <a href="#map"        className="hover:text-orange-400 transition-colors">Heat Map</a>
        <a href="#solutions"  className="hover:text-orange-400 transition-colors">Solutions</a>
        <a href="#comparison" className="hover:text-orange-400 transition-colors">City Chart</a>
        <a href="#carbon"     className="hover:text-orange-400 transition-colors">Carbon</a>
        <a href="#analytics"  className="hover:text-orange-400 transition-colors">Analytics</a>
      </div>
    </nav>
  );
}
