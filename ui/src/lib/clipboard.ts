export default async function copyToClipboard(text: string) {
  // Use the Async Clipboard API when available. Requires a secure browsing
  // context (i.e. HTTPS)
  if (!navigator.clipboard) {
    throw new DOMException("The request is not allowed", "NotAllowedError")
  }
  return navigator.clipboard.writeText(text)
}
