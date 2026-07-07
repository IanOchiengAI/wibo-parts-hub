import { products as staticProducts, categories } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useVehicle } from "@/context/VehicleContext";
import { vehicleFits } from "@/lib/fitment";
import { ShoppingCart, Zap, Check, Search, X, SlidersHorizontal, Ban } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import ProductDetailModal from "./ProductDetailModal";
import QualityBadge from "./QualityBadge";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const MAX_PRICE = 16000;

interface FeaturedProductsProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

const FeaturedProducts = ({ selectedCategory, onCategoryChange }: FeaturedProductsProps) => {
  const { data: products = staticProducts } = useProducts();
  const { addItem } = useCart();
  const { vehicle } = useVehicle();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [fitsOnly, setFitsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc" | "popular" | "newest">("default");

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesOem = p.oemNumber?.toLowerCase().includes(q);
        if (!matchesName && !matchesOem) return false;
      }
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (fitsOnly && !vehicleFits(vehicle, p.fitmentVehicles)) return false;
      return true;
    });
    switch (sortBy) {
      case "price-asc": return [...filtered].sort((a, b) => a.price - b.price);
      case "price-desc": return [...filtered].sort((a, b) => b.price - a.price);
      case "name-asc": return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "popular": return [...filtered].sort((a, b) => b.popularity - a.popularity);
      case "newest": return [...filtered].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      default: return filtered;
    }
  }, [products, searchQuery, selectedCategory, priceRange, fitsOnly, vehicle, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory !== "All" || priceRange[0] !== 0 || priceRange[1] !== MAX_PRICE || fitsOnly || sortBy !== "default";

  const clearFilters = () => {
    setSearchQuery("");
    onCategoryChange("All");
    setPriceRange([0, MAX_PRICE]);
    setFitsOnly(false);
    setSortBy("default");
  };

  return (
    <section id="parts" className="py-20 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-8">
          Featured <span className="text-primary">Parts</span>
        </h2>

        {/* Filter Bar */}
        <div className="glass-hover rounded-2xl p-4 md:p-6 mb-8 space-y-4">
          {/* Search + Fitment row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or OEM number (e.g. 04465-12610)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 font-display"
              />
            </div>
            <div className="flex items-center gap-2" title={!vehicle ? "Select your vehicle in the search above to enable this filter" : ""}>
              <Switch
                checked={fitsOnly}
                onCheckedChange={setFitsOnly}
                disabled={!vehicle}
                className={!vehicle ? "opacity-50" : ""}
              />
              <span className="text-sm font-display text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Check className="w-3 h-3 text-success" />
                {vehicle ? "Fits my car" : "Fits my car (select vehicle first)"}
              </span>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50 font-display text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
                <SelectItem value="name-asc">Name: A → Z</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {["All", ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price range + clear */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-display">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>KSh {priceRange[0].toLocaleString()}</span>
              <span>—</span>
              <span>KSh {priceRange[1].toLocaleString()}</span>
            </div>
            <div className="flex-1 w-full sm:max-w-xs">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={MAX_PRICE}
                step={100}
                minStepsBetweenThumbs={1}
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-display text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors ml-auto"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>

          {/* Result count */}
          <p className="text-xs text-muted-foreground font-display">
            Showing {filteredProducts.length} of {products.length} parts
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <div
              key={product.id}
              className="glass-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.5s ease ${i * 0.08}s`,
              }}
              onClick={() => setSelectedProduct(product)}
            >
              <div className={`relative aspect-[4/3] min-h-44 bg-white/5 flex items-center justify-center overflow-hidden ${!product.inStock ? "opacity-60" : ""}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95"
                  loading="lazy"
                  style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))" }}
                />
                {!product.inStock ? (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-destructive/20 text-destructive text-xs font-semibold px-2 py-1 rounded-full border border-destructive/30">
                    <Ban className="w-3 h-3" /> Out of stock
                  </span>
                ) : vehicleFits(vehicle, product.fitmentVehicles) ? (
                  <span className="absolute top-3 right-3 green-glow flex items-center gap-1 bg-success/20 text-success text-xs font-semibold px-2 py-1 rounded-full border border-success/30">
                    <Check className="w-3 h-3" /> Fits your car
                  </span>
                ) : null}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-display font-semibold text-foreground text-sm">{product.name}</h3>
                  <QualityBadge tier={product.quality_tier} />
                </div>
                <p className="font-display text-xl font-bold text-primary mb-1">KSh {product.price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                  <Zap className="w-3 h-3 text-primary" />
                  {product.inStock ? product.urgency : "Currently unavailable"}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); if (product.inStock) addItem(product); }}
                  disabled={!product.inStock}
                  className="mt-auto w-full py-2.5 rounded-lg font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground animate-pulse-gold hover:brightness-110"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground font-display">No parts match your filters.</p>
              <button onClick={clearFilters} className="mt-2 text-primary text-sm font-display hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={setSelectedProduct}
      />
    </section>
  );
};

export default FeaturedProducts;
