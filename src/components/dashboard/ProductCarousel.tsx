import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  showSocialProof?: boolean;
}

export function ProductCarousel({ title, showSocialProof }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products", title],
    queryFn: async () => {
      let query = supabase.from("products").select("*").limit(8);
      if (showSocialProof) {
        query = query.order("bought_today_count", { ascending: false });
      }
      const { data } = await query;
      return data ?? [];
    },
  });

  const { data: soldToday } = useQuery({
    queryKey: ["sold-today"],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .gte("created_at", todayStart.toISOString());
      const counts: Record<string, number> = {};
      (data ?? []).forEach((row) => {
        counts[row.product_id] = (counts[row.product_id] ?? 0) + row.quantity;
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });

  const addToCart = async (productId: string) => {
    if (!user) return;
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity: 1,
    });
    if (error) {
      toast.error("Failed to add to cart");
    } else {
      toast.success("Added to cart!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-stats"] });
    }
  };

  return (
    <section>
      <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {products?.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="min-w-[200px] max-w-[220px] rounded-xl border bg-card p-4 flex flex-col snap-start hover:shadow-md transition-shadow"
          >
            <div className="w-full aspect-square rounded-lg bg-muted mb-3 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground text-xs">No image</div>
              )}
            </div>
            <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
              {product.name}
            </h3>
            {product.compatibility_tags && product.compatibility_tags.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
              <Check className="w-3 h-3 text-accent" />
                <span className="text-[11px] text-accent font-medium">
                  Fits your vehicle
                </span>
              </div>
            )}
            {showSocialProof && (() => {
              const liveCount = soldToday?.[product.id] ?? 0;
              const countToDisplay = liveCount > 0 ? liveCount : product.bought_today_count;
              if (countToDisplay > 0) {
                return (
                  <p className="text-[11px] text-muted-foreground mb-2">
                    🔥 {countToDisplay} bought today
                  </p>
                );
              }
              return null;
            })()}
            <div className="mt-auto flex items-center justify-between">
              <span className="font-mono font-semibold text-foreground">
                KSh {product.price.toLocaleString()}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-accent hover:bg-accent/10"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id); }}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </Link>
        ))}
        {(!products || products.length === 0) && (
          <p className="text-sm text-muted-foreground py-8">
            No products available yet.
          </p>
        )}
      </div>
    </section>
  );
}
