
import React from "react";

const DownloadOverlayButton = ({ overlayUrl }: { overlayUrl: string }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = overlayUrl;
    link.download = "cloud_cluster_overlay.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      ⬇️ Download Overlay
    </button>
  );
};

export default DownloadOverlayButton;
