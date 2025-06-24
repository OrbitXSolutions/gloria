import { ProductWithCurrency } from "../types/database.types";

export type Product = ProductWithCurrency;

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const CART_STORAGE_KEY = "eleva_cart";

export function getCart(): Cart {
  if (typeof window === "undefined") {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], total: 0, itemCount: 0 };
    }

    const cart = JSON.parse(stored) as Cart;
    return cart;
  } catch {
    return { items: [], total: 0, itemCount: 0 };
  }
}

export function saveCart(cart: Cart): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
}

export function addToCart(product: Product, quantity = 1): Cart {
  const cart = getCart();

  // Check if product already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.id === product.id
  );

  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    const newItem: CartItem = {
      id: Date.now(), // Simple ID generation
      product,
      quantity,
      addedAt: new Date().toISOString(),
    };
    cart.items.push(newItem);
  }

  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => {
    const price = item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: number): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.product.id !== productId);

  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => {
    const price = item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(
  productId: number,
  quantity: number
): Cart {
  const cart = getCart();
  const itemIndex = cart.items.findIndex(
    (item) => item.product.id === productId
  );

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  }

  // Recalculate totals
  cart.total = cart.items.reduce((sum, item) => {
    const price = item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  saveCart(cart);
  return cart;
}

export function clearCart(): Cart {
  const emptyCart: Cart = { items: [], total: 0, itemCount: 0 };
  saveCart(emptyCart);
  return emptyCart;
}

// Helper function to format price with currency
export function formatPrice(
  price: number | null,
  currency?: {
    symbol_en?: string | null;
    symbol_ar?: string | null;
    code?: string | null;
  },
  locale = "en"
): string {
  if (!price) return "0";

  // Get the appropriate symbol based on locale
  let symbol = "$"; // default fallback

  if (currency) {
    if (locale === "ar" && currency.symbol_ar) {
      symbol = currency.symbol_ar;
    } else if (currency.symbol_en) {
      symbol = currency.symbol_en;
    } else if (currency.code) {
      symbol = currency.code; // fallback to currency code
    }
  }

  const formattedPrice = price.toFixed(2);

  // For Arabic, place symbol after the number
  if (locale === "ar") {
    return `${formattedPrice} ${symbol}`;
  }

  return `${symbol}${formattedPrice}`;
}
