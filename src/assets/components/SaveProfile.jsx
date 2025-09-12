function SaveProfile({ formData }) {
  const handleSave = () => {
    localStorage.setItem("comfortKit", JSON.stringify(formData));
    alert("🌊 Your comfort kit is saved!");
  };

  return (
    <div className="text-center py-6">
      <button
        onClick={handleSave}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700"
      >
        Save My Comfort Kit
      </button>
    </div>
  );
}

export default SaveProfile;
