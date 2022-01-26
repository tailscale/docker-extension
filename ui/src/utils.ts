/**
 * timeout allows setting a max deadline for a promise to be executed.
 */
export function timeout<T>(task: Promise<T>, timeout: number) {
  let timer: number
  return Promise.race([
    task,
    new Promise(
      (_, reject) =>
        (timer = window.setTimeout(
          () => reject(new Error("Exceeded timeout")),
          timeout,
        )),
    ),
  ]).finally(() => window.clearTimeout(timer)) as Promise<T>
}

/**
 * openBrowser opens a URL in the host system's browser
 */
export async function openBrowser(url: string) {
  await window.ddClient.execHostCmd(`tsbrowser ${url}`)
}

/**
 * isWindows detects if the current host system is Windows. We rely on the
 * assumption that the Electron instance will give us the right `userAgent`
 * string.
 */
export function isWindows() {
  return navigator.userAgent.match(/Windows/i)
}

/**
 * isMacOS detects if the current host system is MacOS. We rely on the
 * assumption that the Electron instance will give us the right `userAgent`
 * string.
 */
export function isMacOS() {
  return navigator.userAgent.match(/Macintosh/i)
}
