export function requestPersistence(): void {
  navigator.storage?.persist?.();
}
