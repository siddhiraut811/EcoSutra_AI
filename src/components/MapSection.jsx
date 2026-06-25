export default function MapSection() {
  return (
    <section className="p-10">
      <h2 className="text-3xl font-bold mb-5">
        Live Environmental Map
      </h2>

      <div className="h-[500px] rounded-3xl overflow-hidden">
        <iframe
          title="map"
          width="100%"
          height="100%"
          src="https://www.openstreetmap.org/export/embed.html"
        />
      </div>
    </section>
  );
}
