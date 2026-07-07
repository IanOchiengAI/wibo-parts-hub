import { useState, useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import { useVehicle } from "@/context/VehicleContext";
import { supabase } from "@/integrations/supabase/client";
import { products } from "@/data/products";
import { toast } from "sonner";
import { SITE } from "@/config/site";

import { Link } from "react-router-dom";

type Role = "user" | "assistant";
interface Message { role: Role; text: string; }

const catalog = products.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  category: p.category,
  fitmentVehicles: p.fitmentVehicles,
}));

const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
      <Bot className="w-4 h-4 text-primary" />
    </div>
    <div className="max-w-[80%] rounded-xl px-4 py-3 bg-white/5 border border-white/5 flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-green-400"
          style={{ animation: "typing-dot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </div>
);

const renderText = (text: string) =>
  text.split("\n").map((line, j, arr) => (
    <span key={j}>
      {line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/).map((part, k) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={k} className="text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("[") && part.includes("](")) {
          const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (match) {
            return <Link key={k} to={match[2]} className="text-primary hover:underline">{match[1]}</Link>;
          }
        }
        return <span key={k}>{part}</span>;
      })}
      {j < arr.length - 1 && <br />}
    </span>
  ));

const INITIAL_AI_TEXT = (vehicleLabel?: string) =>
  vehicleLabel
    ? `Habari! I see you're looking for parts for your **${vehicleLabel}**. What do you need?`
    : `Habari! I'm Boni, your WIBO parts advisor. Tell me your vehicle make, model and year and I'll find the exact parts you need — with KSh pricing and same-day Nairobi delivery.`;

const BoniChat = () => {
  const { vehicle } = useVehicle();
  const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : undefined;

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: INITIAL_AI_TEXT(vehicleLabel) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const MAX_MSG = 1000;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    if (text.length > MAX_MSG) {
      toast.error(`Message too long — keep it under ${MAX_MSG} characters.`);
      return;
    }

    const userMsg: Message = { role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = history.map((m) => ({ role: m.role, content: m.text }));
      const { data, error } = await supabase.functions.invoke("boni-chat", {
        body: { messages: apiMessages, vehicle, catalog },
      });

      if (error) throw error;
      const aiText: string = data?.text ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: aiText }]);
    } catch {
      toast.error("Boni is unavailable right now. Please WhatsApp us directly.");
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: `I'm having trouble connecting right now. Please WhatsApp us at ${SITE.phone} and we'll help you find the right part.`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <section id="ask-boni-ai" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
              style={{ boxShadow: "0 0 20px hsla(40, 93%, 55%, 0.4)" }}
            >
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Ask <span className="text-primary">Boni AI</span>
            </h2>
          </div>
          <p className="text-muted-foreground">Your intelligent parts advisor. Ask anything.</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden" style={{ background: "hsla(220, 60%, 5%, 0.8)" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">boni-ai — session</span>
          </div>

          <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed font-mono ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground border border-primary/20"
                      : "bg-white/5 text-green-400 border border-white/5"
                  }`}
                >
                  {msg.role === "assistant" && <span className="text-green-500 mr-1">&gt;</span>}
                  {renderText(msg.text)}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any part..."
                  disabled={isTyping}
                  maxLength={MAX_MSG}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground font-mono disabled:opacity-60"
                />
                {input.length > MAX_MSG * 0.8 && (
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono ${input.length >= MAX_MSG ? "text-destructive" : "text-muted-foreground"}`}>
                    {MAX_MSG - input.length}
                  </span>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoniChat;
