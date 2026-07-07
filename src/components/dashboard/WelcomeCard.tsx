import { ShoppingCart, Package, Car } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type CartStatsItem = Pick<Tables<"cart_items">, "quantity"> & {
  products: Pick<Tables<"products">, "price"> | null;
};

export function WelcomeCard() {
  const { user, profile } = useAuth();

  const { data: cartData } = useQuery({
    queryKey: ["cart-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("cart_items")
        .select("quantity, products(price)")
        .eq("user_id", user!.id);
      const items = (data ?? []) as CartStatsItem[];
      const count = items.reduce((s, i) => s + i.quantity, 0);
      const total = items.reduce((s, i) => s + i.quantity * (i.products?.price ?? 0), 0);
      return { count, total };
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ["active-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("status", ["pending", "confirmed", "shipped"]);
      return count ?? 0;
    },
  });

  const { data: vehicleCount } = useQuery({
    queryKey: ["vehicle-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = profile?.name?.split(" ")[0] || "Driver";

  return (
    <div className="rounded-xl bg-primary p-6 text-primary-foreground">
      <h1 className="text-xl font-heading font-bold mb-4">
        {greeting}, {firstName} 👋
      </h1>
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 bg-sidebar-accent/50 rounded-lg px-3 py-2">
          <ShoppingCart className="w-4 h-4 text-accent" />
          <span className="font-mono">
            {cartData?.count ?? 0} items · KSh{" "}
            {(cartData?.total ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-sidebar-accent/50 rounded-lg px-3 py-2">
          <Package className="w-4 h-4 text-accent" />
          <span className="font-mono">{orderCount ?? 0} active order{orderCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2 bg-sidebar-accent/50 rounded-lg px-3 py-2">
          <Car className="w-4 h-4 text-accent" />
          <span className="font-mono">{vehicleCount ?? 0} saved vehicle{vehicleCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
