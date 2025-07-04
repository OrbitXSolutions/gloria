const FAVORITES_STORAGE_KEY = "eleva_favorites";

export function getFavorites(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as number[];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: number[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
}

export function addToFavorites(productId: number): number[] {
  const favorites = getFavorites();
  if (!favorites.includes(productId)) {
    favorites.push(productId);
    saveFavorites(favorites);
  }
  return favorites;
}

export function removeFromFavorites(productId: number): number[] {
  const favorites = getFavorites();
  const filtered = favorites.filter((id) => id !== productId);
  saveFavorites(filtered);
  return filtered;
}

export function isFavorite(productId: number): boolean {
  const favorites = getFavorites();
  return favorites.includes(productId);
}
