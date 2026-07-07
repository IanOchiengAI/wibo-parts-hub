import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench, Search, MapPin, Loader2 } from "lucide-react";
import PageHead from "@/components/PageHead";
import OrderStatusStepper from "@/components/OrderStatusStepper";
import MobileBottomBar from "@/components/MobileBottomBar";

interface TrackItem { product_name: string; quantity: number; price: number; }
interface TrackResult {
  id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  total_amount: number | null;
  created_at: string;
  customer_name: string | null;
  delivery_area: string | null;
  items: TrackItem[];
}

const Track = () => {
  const [orderId, setOrderId] = useState("");
  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<TrackResult | null | "not-found">(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    const ph = phone.trim();
    if (!id || !ph) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc("track_order", {
        p_order_id: id,
        p_phone:    ph,
      }).returns<TrackResult | null>();
      if (error) throw error;
      setResult(data ?? "not-found");
    } catch {
      setResult("not-found");
    } finally {
      setLoading(false);
    }
  };

  const order = result && result !== "not-found" ? result as TrackResult : null;
  const total = order
    ? (order.total_amount ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0))
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHead title="Track Order" description="Look up your WIBO order status without an account." />

      {/* Minimal header */}
      <header className="glass border-b border-white/10 px-4 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-xl font-bold text-primary">WIBO</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pt-12 pb-28 md:pb-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Track your <span className="text-primary">order</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter the order reference from your WhatsApp confirmation and the phone number you used.
            </p>
          </div>

          {/* Lookup form */}
          <form onSubmit={handleTrack} className="glass rounded-2xl p-6 space-y-4 mb-6">
            <div>
              <label className="text-xs text-muted-foreground font-display uppercase tracking-wider block mb-1.5">
                Order reference
              </label>
              <Input
                placeholder="e.g. A1B2C3D4 (from your WhatsApp message)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="bg-white/5 border-white/10 font-mono text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display uppercase tracking-wider block mb-1.5">
                Phone number used at checkout
              </label>
              <Input
                placeholder="e.g. 0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                required
                className="bg-white/5 border-white/10 font-display text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-display font-semibold"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Looking up…</> : "Track Order"}
            </Button>
          </form>

          {/* Not found */}
          {result === "not-found" && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-foreground font-display font-semibold mb-1">Order not found</p>
              <p className="text-muted-foreground text-sm font-display">
                Double-check the order reference and phone number. The reference is the 8-character code from your WhatsApp confirmation.
              </p>
            </div>
          )}

          {/* Result */}
          {order && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-bold text-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground font-display mt-0.5">
                      Placed {new Date(order.created_at).toLocaleDateString("en-KE", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="font-display font-bold text-primary">KSh {Number(total).toLocaleString()}</p>
                </div>
              </div>

              {/* Stepper */}
              <div className="px-5 py-4 border-b border-white/10">
                <OrderStatusStepper status={order.status} />
              </div>

              {/* Items */}
              {order.items.length > 0 && (
                <div className="px-5 py-4 border-b border-white/10">
                  <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-3">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm font-display">
                        <span className="text-foreground/80">{item.quantity}× {item.product_name}</span>
                        <span className="text-primary font-semibold">KSh {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery */}
              {(order.customer_name || order.delivery_area) && (
                <div className="px-5 py-4">
                  <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-2">Delivery</p>
                  {order.customer_name && (
                    <p className="text-sm font-display text-foreground">{order.customer_name}</p>
                  )}
                  {order.delivery_area && (
                    <p className="text-xs text-muted-foreground font-display flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {order.delivery_area}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6 font-display">
            Have an account?{" "}
            <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
            {" "}to see all your orders.
          </p>
        </div>
      </main>

      <MobileBottomBar />
    </div>
  );
};

export default Track;
