import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import PageHead from "@/components/PageHead";
import { Wrench, Phone, Star, CheckCircle } from "lucide-react";
import { SITE } from "@/config/site";

interface Mechanic {
  id: string;
  name: string;
  area: string;
  phone: string;
  whatsapp: string | null;
  specialisations: string[];
  is_verified: boolean;
  rating: number;
  review_count: number;
}

const Mechanics = () => {
  const { data: mechanics = [], isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: async () => {
      // Query verified/active mechanics. Fallback if table doesn't exist yet
      try {
        const { data, error } = await supabase
          .from("mechanics")
          .select("*")
          .eq("is_active", true)
          .order("is_verified", { ascending: false })
          .order("rating", { ascending: false });
        if (error) throw error;
        return data as Mechanic[];
      } catch {
        return []; // return empty if table not migrated yet
      }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title="Find a Mechanic — WIBO"
        description="WIBO-verified mechanics across Nairobi. Find a trusted fundi near you who uses genuine parts."
      />
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-28 md:pb-16 text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Find a <span className="text-primary">Mechanic</span>
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 font-display">
          Partner mechanics who use WIBO genuine parts. Verified for quality and reliability.
        </p>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground font-display">Loading mechanics…</div>
        ) : mechanics.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-sm mb-4">
              We're onboarding verified mechanics across Nairobi. Want to be listed?
            </p>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=Hi%20WIBO%2C%20I'd%20like%20to%20be%20listed%20as%20a%20partner%20mechanic.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:brightness-110 transition-all"
            >
              Apply to Join
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {mechanics.map((m) => (
              <div key={m.id} className="glass-hover rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="font-display font-semibold text-foreground">{m.name}</h2>
                    {m.is_verified && (
                      <span className="flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-display">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-display mb-2">📍 {m.area}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-xs font-display text-foreground">{m.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({m.review_count} reviews)</span>
                  </div>
                  {m.specialisations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.specialisations.map((s) => (
                        <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10 font-display">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <a
                  href={`https://wa.me/${(m.whatsapp ?? m.phone).replace(/\D/g, "")}?text=Hi%2C%20I%20found%20you%20on%20WIBO.%20I%20need%20help%20with%20my%20car.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-display font-semibold text-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <MobileBottomBar />
    </div>
  );
};

export default Mechanics;
