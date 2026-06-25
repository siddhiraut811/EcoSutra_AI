export default function Analytics() {
  return (
    <section className="grid md:grid-cols-3 gap-5 p-10">

      <div className="bg-slate-900 p-6 rounded-2xl">
        <h3>Environmental Health Score</h3>
        <p className="text-6xl text-green-400 mt-3">87</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl">
        <h3>Trees Saved</h3>
        <p className="text-4xl mt-3">12,450</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl">
        <h3>Water Saved</h3>
        <p className="text-4xl mt-3">3.2M L</p>
      </div>

    </section>
  );
}
