import { Car, ChevronDown, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function VehicleSelector() {
  const { user } = useAuth();

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_primary", { ascending: false });
      return data ?? [];
    },
  });

  const primary = vehicles?.find((v) => v.is_primary) ?? vehicles?.[0];

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
          <Car className="w-5 h-5 text-accent" />
        </div>
        <h3 className="font-heading font-semibold text-foreground">
          Your Vehicle
        </h3>
      </div>

      {primary ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">
              {primary.year} {primary.make} {primary.model}
            </p>
            {primary.nickname && (
              <p className="text-xs text-muted-foreground">{primary.nickname}</p>
            )}
          </div>
          <button className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors font-medium">
            Change <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-medium">
          <Plus className="w-4 h-4" /> Add your first vehicle
        </button>
      )}
    </div>
  );
}
