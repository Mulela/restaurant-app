// Simple cart state management using localStorage
const CART_KEY = 'restaurant_cart';

export function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.produit_id === product.id);
  if (existing) {
    existing.quantite += 1;
  } else {
    cart.push({
      produit_id: product.id,
      nom: product.nom,
      prix: product.prix,
      image_url: product.image_url,
      quantite: 1
    });
  }
  saveCart(cart);
}

export function updateQuantity(produitId, quantite) {
  let cart = getCart();
  if (quantite <= 0) {
    cart = cart.filter(item => item.produit_id !== produitId);
  } else {
    const item = cart.find(item => item.produit_id === produitId);
    if (item) item.quantite = quantite;
  }
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.prix * item.quantite, 0);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantite, 0);
}

export function setLastOrderId(id) {
  localStorage.setItem('last_order_id', id);
}

export function getLastOrderId() {
  return localStorage.getItem('last_order_id');
}
