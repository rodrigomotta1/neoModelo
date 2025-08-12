/** Download a data URL by programmatically clicking an <a> element. */
export function downloadDataUrl(filename: string, dataUrl: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }
  
  /** Export a Konva Stage to PNG (higher DPI via pixelRatio). */
  export function exportStageToPNG(stage: any, dpi = 2) {
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: dpi, mimeType: "image/png" });
    downloadDataUrl("diagram.png", dataUrl);
  }
  