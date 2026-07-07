import { useCart } from "@/context/CartContext";
import { useVehicle } from "@/context/VehicleContext";
import { vehicleFits } from "@/lib/fitment";
import { products, type Product } from "@/data/products";
import { X, ShoppingCart, Check, Zap, Car, Wrench, Tag, ChevronRight, Ban } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const ProductDetailModal = ({ product, onClose, onSelectProduct }: ProductDetailModalProps) => {
  const { addItem } = useCart();
  const { vehicle } = useVehicle();

  if (!product) return null;

  const fits = vehicleFits(vehicle, product.fitmentVehicles);

  const relatedProducts = product.relatedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-8 md:inset-y-12 md:inset-x-auto md:max-w-3xl md:w-full md:mx-auto z-50 glass border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-scale-in"
        style={{ background: "hsla(220, 60%, 6%, 0.97)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground truncate">{product.oemNumber}</span>
            {!product.inStock ? (
              <span className="flex items-center gap-1 bg-destructive/20 text-destructive text-xs font-semibold px-2 py-0.5 rounded-full border border-destructive/30 shrink-0">
                <Ban className="w-3 h-3" /> Out of stock
              </span>
            ) : fits ? (
              <span className="green-glow flex items-center gap-1 bg-success/20 text-success text-xs font-semibold px-2 py-0.5 rounded-full border border-success/30 shrink-0">
                <Check className="w-3 h-3" /> Fits your car
              </span>
            ) : null}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top: Image + Info */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-48 h-48 sm:h-48 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{product.category}</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">{product.name}</h2>
              <p className="font-display text-3xl font-bold text-primary mt-2">KSh {product.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <Zap className="w-3 h-3 text-primary" /> {product.urgency}
              </p>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{product.description}</p>
              <button
                onClick={() => { if (product.inStock) { addItem(product); onClose(); } }}
                disabled={!product.inStock}
                className="mt-4 w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-2 animate-pulse-gold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-primary" /> Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="glass-hover rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                  <p className="text-sm font-semibold text-foreground">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fitment Info */}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <Car className="w-4 h-4 text-primary" /> Fitment Vehicles
            </h3>
            <div className="space-y-1.5">
              {product.fitmentVehicles.map((vehicle) => (
                <div key={vehicle} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  {vehicle}
                </div>
              ))}
            </div>
          </div>

          {/* Related Parts */}
          {relatedProducts.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" /> Related Parts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedProducts.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onSelectProduct(related)}
                    className="glass-hover rounded-xl p-3 flex items-center gap-3 text-left group transition-all hover:border-primary/30"
                  >
                    <img src={related.image} alt={related.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{related.name}</h4>
                      <p className="text-primary font-display font-bold text-sm">KSh {related.price.toLocaleString()}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;
