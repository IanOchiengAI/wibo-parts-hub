import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

type ProductSummary = Pick<Tables<"products">, "name" | "price">;
type CartItem = Tables<"cart_items"> & {
  products: ProductSummary | null;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Checkout failed";

export function MiniCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ id: string; total: number } | null>(null);

  const { data: cartItems } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user!.id);
      return (data ?? []) as CartItem[];
    },
  });

  const removeItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["cart-stats"] });
    toast.success("Removed from cart");
  };

  const subtotal =
    cartItems?.reduce(
      (s, item) => s + item.quantity * (item.products?.price ?? 0),
      0
    ) ?? 0;

  const checkout = async () => {
    if (!user || !cartItems || cartItems.length === 0) return;
    setCheckingOut(true);
    try {
      // 1. Create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({ user_id: user.id, status: "pending" as const, total_amount: subtotal })
        .select("id")
        .single();
      if (orderErr || !order) throw orderErr ?? new Error("Failed to create order");

      // 2. Insert order items
      const items = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.products?.price ?? 0,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(items);
      if (itemsErr) throw itemsErr;

      // 3. Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      // 4. Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-stats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      setSuccessOrder({ id: order.id, total: subtotal });
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-80 border-l bg-card h-screen sticky top-0">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-accent" />
            <h3 className="font-heading font-semibold text-foreground">Cart</h3>
            {cartItems && cartItems.length > 0 && (
              <span className="ml-auto text-xs bg-accent/10 text-accent rounded-full px-2 py-0.5 font-mono">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems?.map((item) => {
            const product = item.products;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-background"
              >
                <div className="w-10 h-10 rounded-md bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {product?.name ?? "Product"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium text-foreground">
                    KSh {((product?.price ?? 0) * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {(!cartItems || cartItems.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Your cart is empty
            </p>
          )}
        </div>

        <div className="p-5 border-t space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono font-semibold text-foreground">
              KSh {subtotal.toLocaleString()}
            </span>
          </div>
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-11"
            disabled={!cartItems || cartItems.length === 0 || checkingOut}
            onClick={checkout}
          >
            {checkingOut ? "Processing…" : "Checkout via M-Pesa →"}
          </Button>
        </div>
      </aside>

      <Dialog open={!!successOrder} onOpenChange={() => setSuccessOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Order Placed!
            </DialogTitle>
            <DialogDescription>
              Your order of KSh {successOrder?.total.toLocaleString()} has been placed
              successfully and is pending confirmation.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              setSuccessOrder(null);
              navigate("/orders");
            }}
          >
            View Orders
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
