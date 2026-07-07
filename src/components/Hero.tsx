import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { vehicleMakes, vehicleModels, vehicleYears } from "@/data/products";
import ParticleBackground from "./ParticleBackground";
import { useVehicle } from "@/context/VehicleContext";
import ChassisSearch from "./ChassisSearch";
import SymptomSearch from "./SymptomSearch";

const AnimatedCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = 0;
    const duration = 2000;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const trustPillars = [
  { icon: CheckCircle, label: "Verified Stock", desc: "Every part authenticated" },
  { icon: Shield, label: "Fitment Guarantee", desc: "Right part, guaranteed" },
  { icon: CreditCard, label: "M-Pesa Secured", desc: "Safe mobile payments" },
];

const Hero = () => {
  const { vehicle: contextVehicle, setVehicle } = useVehicle();
  const [make, setMake] = useState(contextVehicle?.make || "");
  const [model, setModel] = useState(contextVehicle?.model || "");
  const [year, setYear] = useState(contextVehicle?.year || "");

  useEffect(() => {
    if (contextVehicle) {
      setMake(contextVehicle.make);
      setModel(contextVehicle.model);
      setYear(contextVehicle.year);
    }
  }, [contextVehicle]);

  const models = make ? vehicleModels[make] || [] : [];

  const handleFindParts = () => {
    if (make && model && year) {
      setVehicle({ make, model, year });
    }
    document.getElementById("parts")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 text-center max-w-4xl mx-auto mb-10">
        <h1 className="font-display text-5xl md:text-7xl font-extrabold text-primary gold-glow mb-4 leading-tight">
          Genuine Parts.<br />Guaranteed Fit.
        </h1>
        <p className="text-lg text-foreground/60 mb-2">
          <AnimatedCounter target={12847} /> parts in stock
        </p>
      </div>

      {/* Vehicle Search Panel */}
      <div className="relative z-10 w-full max-w-2xl glass p-6 rounded-2xl mb-12">
        <Tabs defaultValue="vehicle" className="w-full">
          <TabsList className="w-full bg-white/5 border border-white/10">
            <TabsTrigger value="vehicle" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Search by Vehicle</TabsTrigger>
            <TabsTrigger value="chassis" className="chassis-search-tab flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Chassis Code</TabsTrigger>
            <TabsTrigger value="symptom" className="symptom-search-tab flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">What's Wrong?</TabsTrigger>
            <TabsTrigger value="vin" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Search by VIN</TabsTrigger>
          </TabsList>
          <TabsContent value="vehicle" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <select value={make} onChange={(e) => { setMake(e.target.value); setModel(""); }} className="h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="" className="bg-card">Make</option>
                {vehicleMakes.map((m) => <option key={m} value={m} className="bg-card">{m}</option>)}
              </select>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" disabled={!make}>
                <option value="" className="bg-card">Model</option>
                {models.map((m) => <option key={m} value={m} className="bg-card">{m}</option>)}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="" className="bg-card">Year</option>
                {vehicleYears.map((y) => <option key={y} value={y} className="bg-card">{y}</option>)}
              </select>
            </div>
            <Button onClick={handleFindParts} className="w-full animate-pulse-gold font-display font-semibold">
              <Search className="w-4 h-4 mr-2" /> Find Parts
            </Button>
            {contextVehicle && (
              <div className="mt-3 flex justify-center">
                <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-display border border-primary/30">
                  Vehicle saved: {contextVehicle.year} {contextVehicle.make} {contextVehicle.model}
                </span>
              </div>
            )}
          </TabsContent>
          <TabsContent value="chassis" className="mt-4">
            <ChassisSearch />
          </TabsContent>
          <TabsContent value="symptom" className="mt-4">
            <SymptomSearch />
          </TabsContent>
          <TabsContent value="vin" className="mt-4">
            <div className="flex gap-3 mb-3">
              <Input placeholder="Enter your 17-character VIN" className="flex-1 bg-white/5 border-white/10" />
              <Button
                className="animate-pulse-gold font-display font-semibold"
                onClick={() => toast.info("VIN lookup is coming soon! Use vehicle search or ask Boni AI below.")}
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">VIN lookup coming soon — use vehicle search above or ask Boni AI</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Trust Pillars */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {trustPillars.map((pillar) => (
          <div key={pillar.label} className="glass-hover p-5 rounded-xl text-center group">
            <pillar.icon className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ filter: "drop-shadow(0 0 8px hsla(40, 93%, 55%, 0.5))" }} />
            <h3 className="font-display font-semibold text-foreground mb-1">{pillar.label}</h3>
            <p className="text-sm text-muted-foreground">{pillar.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
