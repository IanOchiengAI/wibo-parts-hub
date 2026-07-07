import { Disc3, Filter, Battery, Cog, ArrowUpDown, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categories } from "@/data/products";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  disc: Disc3, filter: Filter, battery: Battery, cog: Cog, arrowUpDown: ArrowUpDown, zap: Zap,
};

const Categories = ({ onCategorySelect }: { onCategorySelect: (name: string) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="categories" className="py-20 px-4" ref={ref}>
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Shop by <span className="text-primary">Category</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon];
            return (
              <div
                key={cat.name}
                className="glass-hover tilt-card p-6 rounded-2xl flex flex-col items-center gap-3 cursor-pointer group"
                onClick={() => { onCategorySelect(cat.name); document.getElementById("parts")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.5s ease ${i * 0.1}s`,
                }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {Icon && <Icon className="w-7 h-7 text-primary" />}
                </div>
                <span className="font-display font-semibold text-sm text-foreground">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
