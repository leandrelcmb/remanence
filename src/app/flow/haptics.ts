export function softHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate(10);
  }
}

export function mediumHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate(20);
  }
}

export function successHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate([20, 40, 20]);
  }
}