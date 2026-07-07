import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Car } from "lucide-react";
import { lookupChassis } from "@/data/chassisCodes";
import { useVehicle } from "@/context/VehicleContext";
import { toast } from "sonner";

const ChassisSearch = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ReturnType<typeof lookupChassis>>(null);
  const { setVehicle } = useVehicle();

  const handleSearch = () => {
    const match = lookupChassis(query);
    if (!match) {
      toast.error(`Chassis code "${query}" not found. Try NZE141, KDJ150, E11, GD1 etc.`);
      setResult(null);
      return;
    }
    setResult(match);
  };

  const handleUseChassis = () => {
    if (!result) return;
    const year = String(result.yearFrom); // use start year as default
    setVehicle({ make: result.make, model: result.model, year });
    toast.success(`Vehicle set: ${result.make} ${result.model} (${result.code})`);
    document.getElementById("parts")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. NZE141, KDJ150, E11, GD1..."
          className="flex-1 bg-white/5 border-white/10 font-mono text-white"
        />
        <Button onClick={handleSearch} className="animate-pulse-gold font-display font-semibold">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>

      {result && (
        <div className="glass rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="text-left">
              <p className="font-display font-semibold text-white">
                {result.make} {result.model}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {result.code} · {result.yearFrom}–{result.yearTo} · {result.engine}
              </p>
            </div>
          </div>
          <Button size="sm" className="font-display font-semibold flex-shrink-0" onClick={handleUseChassis}>
            Find Parts
          </Button>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Common codes: NZE141, NRE161, KDJ150, SCP10, E11, GD1, GK3, SG5
      </p>
    </div>
  );
};

export default ChassisSearch;
