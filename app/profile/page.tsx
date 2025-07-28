import { ProfileOverview } from "./components/ProfileOverview"
import { getUserProfile, getUserOrders, getUserFavorites } from "@/lib/common/profile-queries"
import { createSsrClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
  const supabase = await createSsrClient()

  // Get the current user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let userProfile = null
  let recentOrders: any[] = []
  let recentFavorites: any[] = []

  if (authUser?.id) {
    try {
      // Get the user ID from the database users table (same pattern as orders page)
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUser.id)
        .single()

      if (!userError && userDataResult?.id) {
        const databaseUserId = userDataResult.id

        // Get user profile with stats using the database user ID
        const profileData = await getUserProfile(databaseUserId)

        if (profileData) {
          // Serialize the user profile data
          userProfile = {
            ...profileData,
            created_at: profileData.created_at ? new Date(profileData.created_at).toISOString() : null,
            updated_at: profileData.updated_at ? new Date(profileData.updated_at).toISOString() : null,
          }

          // Load additional data in parallel using the database user ID
          const [orders, favorites] = await Promise.allSettled([
            getUserOrders(databaseUserId, undefined, 3),
            getUserFavorites(databaseUserId),
          ])

          // Handle orders result
          if (orders.status === "fulfilled") {
            recentOrders = orders.value.map(order => ({
              ...order,
              created_at: order.created_at ? new Date(order.created_at).toISOString() : null,
              updated_at: order.updated_at ? new Date(order.updated_at).toISOString() : null,
              order_items: order.order_items?.map(item => ({
                ...item,
                created_at: item.created_at ? new Date(item.created_at).toISOString() : null,
                updated_at: item.updated_at ? new Date(item.updated_at).toISOString() : null,
                products: item.products ? {
                  ...item.products,
                  created_at: item.products.created_at ? new Date(item.products.created_at).toISOString() : null,
                  updated_at: item.products.updated_at ? new Date(item.products.updated_at).toISOString() : null,
                } : null
              })) || [],
              address: order.address ? {
                ...order.address,
                created_at: order.address.created_at ? new Date(order.address.created_at).toISOString() : null,
                updated_at: order.address.updated_at ? new Date(order.address.updated_at).toISOString() : null,
              } : null,
              user: order.user ? {
                ...order.user,
                created_at: order.user.created_at ? new Date(order.user.created_at).toISOString() : null,
                updated_at: order.user.updated_at ? new Date(order.user.updated_at).toISOString() : null,
              } : null
            }))
          }

          // Handle favorites result
          if (favorites.status === "fulfilled") {
            recentFavorites = favorites.value.slice(0, 3).map(favorite => ({
              ...favorite,
              created_at: favorite.created_at ? new Date(favorite.created_at).toISOString() : null,
              updated_at: favorite.updated_at ? new Date(favorite.updated_at).toISOString() : null,
              product: favorite.product ? {
                ...favorite.product,
                created_at: favorite.product.created_at ? new Date(favorite.product.created_at).toISOString() : null,
                updated_at: favorite.product.updated_at ? new Date(favorite.product.updated_at).toISOString() : null,
                currency: favorite.product.currency ? {
                  ...favorite.product.currency,
                  created_at: favorite.product.currency.created_at ? new Date(favorite.product.currency.created_at).toISOString() : null,
                  updated_at: favorite.product.currency.updated_at ? new Date(favorite.product.currency.updated_at).toISOString() : null,
                } : null
              } : null
            }))
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile data in server component:", error)
    }
  }

  return (
    <ProfileOverview
      initialUserProfile={userProfile as any}
      initialRecentOrders={recentOrders}
      initialRecentFavorites={recentFavorites}
      authUser={authUser}
    />
  )
}
