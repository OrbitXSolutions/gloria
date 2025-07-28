import { OrdersClient } from "./OrdersClient"
import { getUserOrders } from "@/lib/common/profile-queries"
import { createSsrClient } from "@/lib/supabase/server"

export default async function OrdersPage() {
  const supabase = await createSsrClient()

  // Get the current user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let orders: any[] = []
  let userData = null

  if (authUser?.id) {
    try {
      // Get the user ID from the database users table
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUser.id)
        .single()

      if (!userError && userDataResult?.id) {
        userData = userDataResult
        // Fetch orders using the server-side function
        const ordersData = await getUserOrders(userData.id)

        // Serialize the data to ensure it can be passed to client component
        orders = ordersData.map(order => ({
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
    } catch (error) {
      console.error("Error fetching orders in server component:", error)
    }
  }

  return <OrdersClient initialOrders={orders} authUser={authUser} />
}
