"use client";

import { CartProvider } from "../providers/cart-provider";
import { FavoritesProvider } from "../providers/favorites-provider";
import SupabaseProvider from "../providers/SupabaseProvider";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFavorites } from "../providers/favorites-provider";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
}

function IntentApplier() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addFavorite, isFavorite } = useFavorites()
  const tFav = useTranslations('favorites')

  useEffect(() => {
    const intent = searchParams.get('intent')
    if (!intent) return

    const [action, idStr] = intent.split(':')
    if (action === 'favorite') {
      const productId = Number(idStr)
      if (Number.isFinite(productId) && !isFavorite(productId)) {
        addFavorite(productId)
        toast.success(tFav('added'))
      }
    }

    // Clean param from URL
    const params = new URLSearchParams(searchParams as any)
    params.delete('intent')
    const newPath = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.replace(newPath)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return null
}

export function ClientWrapper({ children }: Props) {
  return (
    <SupabaseProvider>
      <CartProvider>
        <FavoritesProvider>
          <IntentApplier />
          {children}
        </FavoritesProvider>
      </CartProvider>
    </SupabaseProvider>
  )
}
