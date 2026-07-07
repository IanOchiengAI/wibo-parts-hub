import { Clock, CheckCircle2, Truck, PackageCheck } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

const STEPS: { key: OrderStatus; label: string; sublabel: string; icon: React.FC<{ className?: string }> }[] = [
  { key: "pending",   label: "Pending",   sublabel: "Order received",      icon: Clock        },
  { key: "confirmed", label: "Confirmed", sublabel: "Parts being prepared", icon: CheckCircle2 },
  { key: "shipped",   label: "Shipped",   sublabel: "On the way to you",   icon: Truck        },
  { key: "delivered", label: "Delivered", sublabel: "Order complete",       icon: PackageCheck },
];

const ORDER: Record<OrderStatus, number> = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 };

interface Props { status: OrderStatus; }

export default function OrderStatusStepper({ status }: Props) {
  const current = ORDER[status] ?? 0;

  return (
    <div className="w-full py-3">
      <div className="flex items-start justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-0 right-0 h-px bg-white/10 z-0" />
        <div
          className="absolute top-4 left-0 h-px bg-primary z-0 transition-all duration-500"
          style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map(({ key, label, sublabel, icon: Icon }, i) => {
          const done    = i < current;
          const active  = i === current;
          const future  = i > current;
          return (
            <div key={key} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? "bg-primary border-primary" :
                active ? "bg-primary/20 border-primary" :
                         "bg-background border-white/20"
              }`}>
                <Icon className={`w-3.5 h-3.5 ${done || active ? "text-primary" : "text-muted-foreground"} ${active ? "animate-pulse" : ""}`} />
              </div>
              <p className={`text-xs font-display font-semibold text-center leading-tight ${
                future ? "text-muted-foreground/50" : active ? "text-primary" : "text-foreground"
              }`}>{label}</p>
              <p className={`text-[10px] font-display text-center leading-tight hidden sm:block ${
                future ? "text-muted-foreground/30" : "text-muted-foreground"
              }`}>{sublabel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
