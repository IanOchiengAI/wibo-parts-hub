import { Car, Search, CreditCard, Truck } from "lucide-react";

const STEPS = [
  {
    icon: Car,
    step: "01",
    title: "Select your vehicle",
    desc: "Enter your car's make, model and year. Every result is filtered to what fits.",
  },
  {
    icon: Search,
    step: "02",
    title: "Find your part",
    desc: "Browse by category, search by name, or ask Boni AI. OEM numbers included.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Pay with M-Pesa",
    desc: "Confirm your order on WhatsApp and pay instantly with M-Pesa. No card needed.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Delivered today",
    desc: "Order before 2 PM and get same-day delivery anywhere in Nairobi.",
  },
];

const TESTIMONIALS = [
  {
    name: "James M.",
    location: "Westlands",
    text: "Got brake pads for my Fielder in under 3 hours. Genuine parts, exactly as described.",
    stars: 5,
  },
  {
    name: "Grace W.",
    location: "Karen",
    text: "Boni AI found the right shock absorbers for my Harrier on the first try. Impressive.",
    stars: 5,
  },
  {
    name: "Peter O.",
    location: "Ngong Road",
    text: "Best prices in Nairobi for Toyota parts. Delivery was faster than promised.",
    stars: 5,
  },
];

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5 mb-2">
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} className="text-primary text-sm">★</span>
    ))}
  </div>
);

const HowItWorks = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto max-w-5xl">

      {/* How it works */}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        How <span className="text-primary">WIBO</span> works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {STEPS.map(({ icon: Icon, step, title, desc }) => (
          <div key={step} className="glass-hover rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-mono text-xs text-primary/50 font-bold">{step}</span>
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-10">
        What customers <span className="text-primary">say</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map(({ name, location, text, stars }) => (
          <div key={name} className="glass-hover rounded-2xl p-6">
            <Stars count={stars} />
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">"{text}"</p>
            <div>
              <p className="font-display font-semibold text-foreground text-sm">{name}</p>
              <p className="text-xs text-muted-foreground font-display">{location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
