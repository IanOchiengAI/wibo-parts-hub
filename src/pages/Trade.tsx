import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHead from "@/components/PageHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { SITE } from "@/config/site";

const FLEET_SIZES = ["1–3 vehicles", "4–10 vehicles", "11–30 vehicles", "30+ vehicles"];

const Trade = () => {
  const [form, setForm] = useState({
    business_name: "",
    contact_name: "",
    phone: "",
    email: "",
    location: "",
    fleet_size: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name || !form.contact_name || !form.phone || !form.location) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("trade_applications").insert(form);
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      // Fallback in case table doesn't exist yet
      toast.error("Database connection issue. Sending your application via WhatsApp instead!");
      const waMsg = encodeURIComponent(
        `Hi WIBO! I'd like to apply for a Trade Account.\n\n` +
        `Business: ${form.business_name}\n` +
        `Contact: ${form.contact_name}\n` +
        `Phone: ${form.phone}\n` +
        `Location: ${form.location}\n` +
        `Fleet: ${form.fleet_size || "N/A"}\n` +
        `Notes: ${form.notes || "None"}`
      );
      window.open(`https://wa.me/${SITE.whatsapp}?text=${waMsg}`, "_blank");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-400" />
      <h1 className="font-display text-3xl font-bold text-white">Application Received!</h1>
      <p className="text-muted-foreground max-w-sm">
        Our team will review your application and contact you within 24 hours to set up your trade account.
      </p>
      <Button onClick={() => window.location.href = "/"} className="font-display">
        Return to Store
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title="Trade Account — WIBO"
        description="Apply for a WIBO trade account. Bulk pricing, invoices, and credit terms for mechanics and fleet managers."
      />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-16 text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            Trade <span className="text-primary">Account</span>
          </h1>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {["10% off bulk orders", "PDF invoices (VAT)", "Priority delivery", "Dedicated support"].map((b) => (
            <div key={b} className="glass rounded-xl p-3 text-center">
              <p className="text-xs font-display text-primary font-semibold">{b}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Business Details</p>
          <Input required placeholder="Business / Garage name *" value={form.business_name}
            onChange={(e) => setForm((p) => ({ ...p, business_name: e.target.value }))}
            className="bg-white/5 border-white/10 text-white" />
          <Input required placeholder="Contact person name *" value={form.contact_name}
            onChange={(e) => setForm((p) => ({ ...p, contact_name: e.target.value }))}
            className="bg-white/5 border-white/10 text-white" />
          <Input required placeholder="WhatsApp / Phone number *" type="tel" value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="bg-white/5 border-white/10 text-white" />
          <Input placeholder="Email address" type="email" value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="bg-white/5 border-white/10 text-white" />
          <Input required placeholder="Location / Area (e.g. Westlands, Mombasa Road) *" value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            className="bg-white/5 border-white/10 text-white" />

          <select value={form.fleet_size}
            onChange={(e) => setForm((p) => ({ ...p, fleet_size: e.target.value }))}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="" className="bg-card">Fleet size (optional)</option>
            {FLEET_SIZES.map((s) => <option key={s} value={s} className="bg-card">{s}</option>)}
          </select>

          <Textarea placeholder="Tell us more about your business (optional)" value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="bg-white/5 border-white/10 text-white resize-none" rows={3} />

          <Button type="submit" disabled={loading}
            className="w-full font-display font-bold animate-pulse-gold">
            {loading ? "Submitting…" : "Apply for Trade Account →"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Trade;
