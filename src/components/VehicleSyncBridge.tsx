import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVehicle } from "@/context/VehicleContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * VehicleSyncBridge
 * Runs once after login. If the user has a primary vehicle saved in Supabase
 * and nothing is selected in VehicleContext (localStorage), it auto-populates
 * the context so the fitment filter works without the user manually re-selecting.
 */
const VehicleSyncBridge = () => {
  const { user } = useAuth();
  const { vehicle, setVehicle } = useVehicle();

  useEffect(() => {
    if (!user || vehicle) return; // already have a vehicle, or user logged out

    supabase
      .from("vehicles")
      .select("make, model, year")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setVehicle({ make: data.make, model: data.model, year: data.year });
        }
      });
  }, [user?.id]); // only re-run when user ID changes (login/logout)

  return null; // renders nothing
};

export default VehicleSyncBridge;
