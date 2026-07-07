import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import PageHead from "@/components/PageHead";
import OrderStatusStepper from "@/components/OrderStatusStepper";
import { Package, ChevronDown, ChevronUp, Loader2, MapPin, Search, RefreshCw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/context/CartContext";
import { products as staticProducts } from "@/data/products";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type OrderStatus = "all" | "pending" | "confirmed" | "shipped" | "delivered";
type OrderRow = Tables<"orders"> & {
  order_items?: Array<Tables<"order_items"> & { products?: Tables<"products"> | null }>;
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const { addItem, toggleCart } = useCart();
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items(*, products(*))`)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .returns<OrderRow[]>();
      if (error) throw error;
      return data || [];
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const filtered = activeStatus === "all"
    ? orders || []
    : (orders || []).filter((o) => o.status === activeStatus);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const statuses: OrderStatus[] = ["all", "pending", "confirmed", "shipped", "delivered"];

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="My Orders" description="Track your WIBO auto parts orders and delivery status." />
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-28 md:pb-16">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My <span className="text-primary">Orders</span>
            </h1>
          </div>
          <Link
            to="/track"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-display"
          >
            <Search className="w-3.5 h-3.5" /> Track without account
          </Link>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-display font-semibold border transition-all ${
                activeStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground text-sm">
              {activeStatus === "all"
                ? "You haven't placed any orders yet."
                : `No ${activeStatus} orders found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const isOpen = expanded.has(order.id);
              const total = order.total_amount
                ?? order.order_items?.reduce((s, i) => s + i.price * i.quantity, 0)
                ?? 0;

              return (
                <div key={order.id} className="glass-hover rounded-2xl overflow-hidden">
                  {/* Row header */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-semibold text-foreground text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        {order.delivery_area && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground font-display">
                            <MapPin className="w-3 h-3" />{order.delivery_area}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-display mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-display font-semibold text-primary text-sm">
                        KSh {Number(total).toLocaleString()}
                      </span>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Status stepper — always visible */}
                  <div className="px-5 pb-3 border-t border-white/5">
                    <OrderStatusStepper status={order.status} />
                  </div>

                  {/* Expanded: items + delivery details */}
                  {isOpen && (
                    <div className="border-t border-white/10 px-5 pb-5">
                      {order.order_items?.length > 0 && (
                        <div className="overflow-x-auto mt-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-2 font-display font-semibold text-muted-foreground text-xs">Product</th>
                                <th className="text-center py-2 font-display font-semibold text-muted-foreground text-xs">Qty</th>
                                <th className="text-right py-2 font-display font-semibold text-muted-foreground text-xs">Price</th>
                                <th className="text-right py-2 font-display font-semibold text-muted-foreground text-xs">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.order_items.map((item) => (
                                <tr key={item.id} className="border-b border-white/5">
                                  <td className="py-2 font-display text-foreground">
                                    {item.products?.name ?? item.product_name ?? "—"}
                                  </td>
                                  <td className="py-2 text-center text-muted-foreground font-display">{item.quantity}</td>
                                  <td className="py-2 text-right text-muted-foreground font-display">
                                    KSh {Number(item.price).toLocaleString()}
                                  </td>
                                  <td className="py-2 text-right font-display font-semibold text-primary">
                                    KSh {(Number(item.price) * item.quantity).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Delivery details */}
                      {(order.customer_name || order.delivery_area || order.notes) && (
                        <div className="mt-4 glass rounded-xl p-4 space-y-1">
                          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-2">Delivery info</p>
                          {order.customer_name && (
                            <p className="text-sm font-display text-foreground">{order.customer_name}</p>
                          )}
                          {order.customer_phone && (
                            <p className="text-xs text-muted-foreground font-display">{order.customer_phone}</p>
                          )}
                          {order.delivery_area && (
                            <p className="text-xs text-muted-foreground font-display flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {order.delivery_area}
                            </p>
                          )}
                          {order.notes && (
                            <p className="text-xs text-muted-foreground font-display italic">"{order.notes}"</p>
                          )}
                        </div>
                      )}
                      {order.status === "delivered" && order.order_items && order.order_items.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-4 font-display text-xs border-white/10 hover:bg-white/5 gap-1.5"
                          onClick={() => {
                            let added = 0;
                            order.order_items!.forEach((item) => {
                              const product = staticProducts.find((p) => p.id === item.product_id);
                              if (product) {
                                for (let i = 0; i < item.quantity; i++) addItem(product);
                                added++;
                              }
                            });
                            if (added > 0) {
                              toggleCart();
                              toast.success("Items added to cart — ready to reorder!");
                            } else {
                              toast.info("These products are no longer in our catalogue. Contact us on WhatsApp.");
                            }
                          }}
                        >
                          <RefreshCw className="w-3 h-3" /> Reorder
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
      <MobileBottomBar />
    </div>
  );
};

export default Orders;
