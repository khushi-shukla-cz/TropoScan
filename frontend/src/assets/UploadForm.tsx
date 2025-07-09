import React, { useState } from "react";

interface UploadFormProps {
  setResult: (result: any) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ setResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Server Error");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(
        "❌ Failed to upload or analyze. Please check the server and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2"
      />

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Upload & Detect"}
      </button>

      {error && <div className="text-red-500 font-medium text-sm">{error}</div>}
    </div>
  );
};

export default UploadForm;
