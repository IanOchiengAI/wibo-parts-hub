import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

const CartSidebar = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSuccess = () => {
    setShowCheckout(false);
    closeCart();
    items.forEach((i) => removeItem(i.product.id));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 glass border-l border-white/10 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "hsla(220, 60%, 6%, 0.95)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-foreground">Your Cart</h2>
          <button onClick={closeCart} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Close cart">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground mt-12 font-display">Your cart is empty</p>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="glass-hover rounded-xl p-3 flex gap-3">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{product.name}</h4>
                  <p className="text-primary font-display font-bold text-sm">KSh {product.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 rounded bg-white/10 flex items-center justify-center hover:bg-white/20"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-6 h-6 rounded bg-white/10 flex items-center justify-center hover:bg-white/20"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="ml-auto text-destructive hover:text-destructive/80"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground font-display">Subtotal</span>
              <span className="font-display text-xl font-bold text-foreground">KSh {subtotal.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base animate-pulse-gold hover:brightness-110 transition-all"
            >
              Checkout with M-Pesa →
            </button>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          items={items}
          subtotal={subtotal}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default CartSidebar;
