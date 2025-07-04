"use client";

import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "@/lib/common/favorites";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (productId: number) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage on mount
    setFavorites(getFavorites());
    setIsLoading(false);
  }, []);

  const addFavorite = (productId: number) => {
    const updatedFavorites = addToFavorites(productId);
    setFavorites(updatedFavorites);
  };

  const removeFavorite = (productId: number) => {
    const updatedFavorites = removeFromFavorites(productId);
    setFavorites(updatedFavorites);
  };

  const checkIsFavorite = (productId: number) => {
    return favorites.includes(productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite: checkIsFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
