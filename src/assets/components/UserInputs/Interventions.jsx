const options = [
  { key: "breathing", label: "🌬️ Breathing Visualizer" },
  { key: "bubbles", label: "🎈 Floating Bubbles Game" },
  { key: "mindfulness", label: "🧘 Mindfulness Prompts" },
  { key: "chatbot", label: "🤖 Chatbot (text/voice)" },
];

function Interventions({ formData, setFormData }) {
  const toggle = (key) => {
    const selected = new Set(formData.interventions);
    if (selected.has(key)) selected.delete(key);
    else selected.add(key);
    setFormData({ ...formData, interventions: [...selected] });
  };

  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-4">✨ Intervention Preferences</h2>
      {options.map((opt) => (
        <label key={opt.key} className="block mb-2">
          <input
            type="checkbox"
            checked={formData.interventions.includes(opt.key)}
            onChange={() => toggle(opt.key)}
          />{" "}
          {opt.label}
        </label>
      ))}
    </section>
  );
}

export default Interventions;
