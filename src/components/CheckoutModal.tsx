import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SITE } from "@/config/site";
import type { CartItem } from "@/context/CartContext";
import type { TablesInsert } from "@/integrations/supabase/types";

const NAIROBI_AREAS = [
  "Nairobi CBD", "Westlands", "Karen", "Kilimani", "Lavington",
  "Ngong Road", "South B / South C", "Eastlands", "Kasarani",
  "Thika Road", "Mombasa Road", "Industrial Area", "Parklands",
  "Ruaka", "Kiambu Town", "Other — specify in notes",
];

interface Props {
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal = ({ items, subtotal, onClose, onSuccess }: Props) => {
  const { user, profile } = useAuth();
  const [name,  setName]  = useState(profile?.name  ?? "");
  const [phone, setPhone] = useState("");
  const [area,  setArea]  = useState("");
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !area) {
      toast.error("Please fill in your name, phone, and delivery area.");
      return;
    }

    setLoading(true);
    let orderId: string | null = null;

    if (user) {
      try {
        const orderPayload: TablesInsert<"orders"> = {
          user_id: user.id,
          status: "pending",
          total_amount: subtotal,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          delivery_area: area,
          notes: notes.trim() || null,
        };

        const { data: order, error: oErr } = await supabase
          .from("orders")
          .insert(orderPayload)
          .select("id")
          .single();

        if (oErr) throw oErr;
        orderId = order.id as string;

        const lineItems: TablesInsert<"order_items">[] = items.map(({ product, quantity }) => ({
          order_id:     orderId,
          product_id:   product.id,
          product_name: product.name,
          quantity,
          price:        product.price,
        }));
        await supabase.from("order_items").insert(lineItems);
      } catch {
        toast.error("Could not save order — proceeding to WhatsApp anyway.");
      }
    }

    // Build WhatsApp message
    const ref = orderId ? `*Order ref: #${(orderId as string).slice(0, 8).toUpperCase()}*\n\n` : "";
    const itemLines = items
      .map(({ product, quantity }) =>
        `- ${quantity}x ${product.name} — KSh ${(product.price * quantity).toLocaleString()}`
      )
      .join("\n");
    const delivery = [
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Area: ${area}`,
      notes.trim() ? `Notes: ${notes.trim()}` : "",
    ].filter(Boolean).join("\n");

    const msg = encodeURIComponent(
      `Hi WIBO! I'd like to place an order.\n\n${ref}*Items:*\n${itemLines}\n\n*Total: KSh ${subtotal.toLocaleString()}*\n\n*Delivery details:*\n${delivery}\n\nPlease confirm and send M-Pesa payment details.`
    );

    window.open(`https://wa.me/${SITE.whatsapp}?text=${msg}`, "_blank", "noopener,noreferrer");
    setConfirmedOrderId(orderId);
    setStep("success");
    setLoading(false);
  };

  if (step === "success") {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <div
          className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 glass border border-white/10 rounded-2xl flex flex-col items-center justify-center p-10 text-center gap-6 animate-scale-in"
          style={{ background: "hsla(220, 60%, 6%, 0.97)" }}
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Order Placed! 🎉</h2>
            {confirmedOrderId && (
              <p className="text-sm font-mono text-primary mb-1">
                Ref: #{confirmedOrderId.slice(0, 8).toUpperCase()}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Check WhatsApp — we'll send you M-Pesa payment details shortly.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 font-display border-white/10 hover:bg-white/5"
              onClick={onSuccess}
            >
              Close
            </Button>
            <Button
              className="flex-1 font-display bg-primary text-primary-foreground hover:brightness-110"
              onClick={() => {
                onSuccess();
                navigate("/orders");
              }}
            >
              View My Orders
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 glass border border-white/10 rounded-2xl flex flex-col overflow-hidden animate-scale-in"
        style={{ background: "hsla(220, 60%, 6%, 0.97)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-display text-lg font-bold text-foreground">Confirm your order</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Cart summary */}
          <div className="glass rounded-xl p-4 mb-5 space-y-2">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm font-display">
                <span className="text-foreground/80">{quantity}× {product.name}</span>
                <span className="text-primary font-semibold">KSh {(product.price * quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 flex justify-between font-display font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">KSh {subtotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery form */}
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-2">Delivery details</p>
            <Input
              placeholder="Full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/5 border-white/10 font-display"
            />
            <Input
              placeholder="WhatsApp number (e.g. 0712 345 678) *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              required
              className="bg-white/5 border-white/10 font-display"
            />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" className="bg-card">Delivery area *</option>
              {NAIROBI_AREAS.map((a) => (
                <option key={a} value={a} className="bg-card">{a}</option>
              ))}
            </select>
            <Input
              placeholder="Notes (landmark, gate colour, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/10 font-display"
            />
          </form>

          {!user && (
            <p className="mt-3 text-xs text-muted-foreground font-display">
              <span className="text-primary">Tip:</span> Sign in to track this order in "My Orders".
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <Button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="w-full font-display font-bold bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving order…</>
              : <><MessageCircle className="w-4 h-4" /> Confirm & Pay via M-Pesa</>
            }
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2 font-display">
            You'll complete payment on WhatsApp
          </p>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;
