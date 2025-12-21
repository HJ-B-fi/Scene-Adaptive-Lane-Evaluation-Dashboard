export default function ScenarioSelector({ scenes, value, onChange }) {
  return (
    <select
      className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {scenes.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}