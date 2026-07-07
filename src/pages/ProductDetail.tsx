import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, Check, Users } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import PageHead from "@/components/PageHead";
import QualityBadge from "@/components/QualityBadge";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: id!,
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
    <div className="min-h-screen">
      <PageHead title={product ? `${product.name} — WIBO Parts` : "Product Details"} />
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 pt-24 pb-32 md:pb-16">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        )}

        {!isLoading && !product && (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-foreground mb-2">Product not found</h2>
            <p className="text-muted-foreground">This product may have been removed.</p>
          </div>
        )}

        {product && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-xl bg-muted overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.category && (
                    <Badge variant="secondary">
                      {product.category}
                    </Badge>
                  )}
                  <QualityBadge tier={(product as any).quality_tier ?? "oem"} />
                </div>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  {product.name}
                </h1>
              </div>

              <p className="text-3xl font-mono font-semibold text-foreground">
                KSh {product.price.toLocaleString()}
              </p>

              {product.compatibility_tags && product.compatibility_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.compatibility_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                    >
                      <Check className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {product.bought_today_count > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {product.bought_today_count} people bought this today
                </div>
              )}

              <Button
                size="lg"
                className="mt-4 w-full md:w-auto"
                onClick={addToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
