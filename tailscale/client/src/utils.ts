/**
 * openBrowser opens a URL in the host system's browser
 */
export async function openBrowser(url: string) {
  await window.ddClient.execHostCmd(`tsbrowser ${url}`)
}
