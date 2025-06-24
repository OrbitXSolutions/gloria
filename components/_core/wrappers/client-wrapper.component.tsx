"use client";

import { CartProvider } from "../providers/cart-provider";
import { FavoritesProvider } from "../providers/favorites-provider";
import SupabaseProvider from "../providers/SupabaseProvider";

interface Props {
	children: React.ReactNode;
}

export function ClientWrapper({ children }: Props) {
	return (
    <SupabaseProvider>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </SupabaseProvider>
  );

}
