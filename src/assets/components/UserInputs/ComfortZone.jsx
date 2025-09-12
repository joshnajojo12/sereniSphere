function ComfortZone({ formData, setFormData }) {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🎵 Personal Comfort Zone</h2>

      <label className="block mb-2">Favorite Music/Playlist</label>
      <input
        type="text"
        placeholder="Spotify/YouTube link"
        className="border rounded w-full p-2 mb-4"
        value={formData.music}
        onChange={(e) => setFormData({ ...formData, music: e.target.value })}
      />

      <label className="block mb-2">Hobbies/Distractions</label>
      <input
        type="text"
        placeholder="e.g., Drawing, Gardening"
        className="border rounded w-full p-2 mb-4"
        value={formData.hobbies}
        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
      />

      <label className="block mb-2">Comfort Visuals</label>
      <input
        type="file"
        accept="image/*"
        className="border rounded w-full p-2"
        onChange={(e) => setFormData({ ...formData, visuals: e.target.files[0] })}
      />
    </section>
  );
}

export default ComfortZone;
