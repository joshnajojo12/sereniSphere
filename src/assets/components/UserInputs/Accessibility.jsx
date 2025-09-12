function Accessibility({ formData, setFormData }) {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-4">♿ Accessibility Settings</h2>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.tts}
          onChange={(e) => setFormData({ ...formData, tts: e.target.checked })}
        />
        Enable Text-to-Speech
      </label>
    </section>
  );
}

export default Accessibility;
