type AttachmentRef = {
  dataUrl?: string;
};

function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mimeType, base64] = match;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  } catch {
    return null;
  }
}

export function openAttachment(attachment: AttachmentRef) {
  if (typeof window === "undefined") return;
  const dataUrl = attachment.dataUrl;
  if (!dataUrl) return;

  if (!dataUrl.startsWith("data:")) {
    window.open(dataUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const blob = dataUrlToBlob(dataUrl);
  if (!blob) {
    window.open(dataUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const blobUrl = URL.createObjectURL(blob);
  const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = blobUrl;
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
