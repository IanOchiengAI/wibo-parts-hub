import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVehicle } from "@/context/VehicleContext";

export function BoniAI() {
  const { vehicle } = useVehicle();
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    {
      role: "ai",
      text: vehicle
        ? `Habari! I see you're looking for parts for your ${vehicle.year} ${vehicle.make} ${vehicle.model}. What do you need?`
        : "Habari! I'm Boni, your WIBO parts advisor. Tell me your vehicle make, model and year and I'll find the exact parts you need.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: "user" as const, text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = history.map((m) => ({
        role: m.role === "ai" ? "assistant" : m.role,
        content: m.text,
      }));

      const { data, error } = await supabase.functions.invoke("boni-chat", {
        body: { messages: apiMessages, vehicle, catalog: [] },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "ai" as const, text: data?.text ?? "Sorry, I couldn't get a response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai" as const,
          text: "Boni is offline right now. Please WhatsApp us directly.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="rounded-xl border bg-foreground/95 overflow-hidden flex flex-col h-80">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
        <h3 className="font-heading font-semibold text-sm text-white">
          Ask Boni AI
        </h3>
        {vehicle && (
          <span className="text-[10px] ml-auto bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-mono">
            {vehicle.make}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm font-mono leading-relaxed ${
              msg.role === "ai"
                ? "text-green-400"
                : "text-white/80 text-right"
            }`}
          >
            {msg.role === "ai" && (
              <span className="text-accent mr-1">{">"}</span>
            )}
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="text-sm font-mono text-green-400/60 leading-relaxed animate-pulse">
            <span className="text-accent mr-1">{">"}</span>Boni is typing...
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-white/10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about parts, compatibility..."
          disabled={isTyping}
          className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-white/30 outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          className="text-accent hover:text-accent/80 transition-colors disabled:opacity-40"
        >
          {isTyping ? (
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
