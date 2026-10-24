import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Hand a generated file to the Android share sheet.
 *
 * In the app a browser download has nowhere to land: `jsPDF.save()`,
 * `XLSX.writeFile` and `<a download>` all do nothing inside the WebView. The
 * file is written to the app's cache instead and offered through the share
 * sheet, which is also where a trainer wants it anyway — WhatsApp, email,
 * Drive. The cache directory is the OS's to clear, so nothing piles up.
 *
 * Only called when `isNativeApp`; the web keeps its own download code.
 */
export async function shareFile(
  filename: string,
  base64: string,
  title: string,
): Promise<void> {
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });

  try {
    await Share.share({ title, files: [uri] });
  } catch (error) {
    // Closing the share sheet is a choice, not a failure.
    if (isShareCancel(error)) return;
    throw error;
  }
}

function isShareCancel(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /cancel/i.test(message);
}

/** A data URI or a Blob, as the bare base64 the Filesystem plugin expects. */
export function stripDataUri(dataUri: string): string {
  return dataUri.slice(dataUri.indexOf(',') + 1);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(stripDataUri(String(reader.result)));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(blob);
  });
}
