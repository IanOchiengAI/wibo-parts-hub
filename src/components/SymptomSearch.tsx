import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVehicle } from "@/context/VehicleContext";

const EXAMPLE_SYMPTOMS = [
  "My car shakes when I brake",
  "Kuna sauti front left kwenye suspension",
  "Check engine light is on",
  "My battery keeps dying",
  "White smoke from exhaust",
];

const SymptomSearch = () => {
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const { vehicle } = useVehicle();

  const handleAsk = async () => {
    if (!symptom.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const vehicleContext = vehicle
        ? `The customer's vehicle is a ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
        : "";
      const { data, error } = await supabase.functions.invoke("boni-chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `${vehicleContext} The customer describes this problem: "${symptom}". In 2–3 sentences, tell them which parts they likely need and why. Be specific and mention KSh pricing range if you can.`,
            },
          ],
          vehicle,
          catalog: [],
        },
      });
      if (error) throw error;
      setAnswer(data?.text ?? "Please scroll down to ask Boni AI directly.");
    } catch {
      setAnswer("Boni is busy right now. Scroll down to chat with her or WhatsApp us.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-left">
      <textarea
        value={symptom}
        onChange={(e) => setSymptom(e.target.value)}
        placeholder="Describe what's wrong with your car... (English or Swahili)"
        rows={3}
        className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground resize-none"
      />

      {/* Example symptoms */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_SYMPTOMS.map((s) => (
          <button
            key={s}
            onClick={() => setSymptom(s)}
            className="text-[11px] px-2 py-1 rounded-full bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary border border-white/10 transition-colors font-display"
          >
            {s}
          </button>
        ))}
      </div>

      <Button
        onClick={handleAsk}
        disabled={loading || !symptom.trim()}
        className="w-full font-display font-semibold animate-pulse-gold"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Asking Boni...</>
        ) : (
          <><MessageSquare className="w-4 h-4 mr-2" /> Ask Boni AI</>
        )}
      </Button>

      {answer && (
        <div className="glass rounded-xl p-4 border border-primary/20 bg-black/40">
          <p className="text-sm text-green-400 font-mono leading-relaxed">&gt; {answer}</p>
          <button
            onClick={() => document.getElementById("ask-boni-ai")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-2 text-xs text-primary font-display hover:underline"
          >
            Continue chatting with Boni ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomSearch;
