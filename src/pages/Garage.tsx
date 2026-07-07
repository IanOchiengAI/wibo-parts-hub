import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useVehicle } from "@/context/VehicleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import PageHead from "@/components/PageHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Car, Plus, Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/errors";
import { vehicleMakes, vehicleModels, vehicleYears } from "@/data/products";

interface GarageVehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: string;
  is_primary: boolean;
  nickname: string | null;
  chassis_code?: string;
  created_at: string;
}

interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  nickname: string;
  chassis_code?: string;
}

const defaultForm: VehicleFormData = { make: "", model: "", year: "", nickname: "", chassis_code: "" };

const Garage = () => {
  const { user, loading: authLoading } = useAuth();
  const { vehicle: contextVehicle } = useVehicle();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [editVehicle, setEditVehicle] = useState<GarageVehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GarageVehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["garage-vehicles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as GarageVehicle[];
    },
  });

  const models = formData.make ? vehicleModels[formData.make] || [] : [];

  const openAdd = () => {
    setEditVehicle(null);
    setFormData(defaultForm);
    setShowDialog(true);
  };

  const openEdit = (v: GarageVehicle) => {
    setEditVehicle(v);
    setFormData({ make: v.make, model: v.model, year: v.year, nickname: v.nickname || "", chassis_code: v.chassis_code || "" });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.make || !formData.model || !formData.year) {
      toast.error("Please fill in make, model, and year.");
      return;
    }
    setSaving(true);
    if (editVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update({
          make: formData.make,
          model: formData.model,
          year: formData.year,
          nickname: formData.nickname || null,
          chassis_code: formData.chassis_code || null
        } as any)
        .eq("id", editVehicle.id);
      setSaving(false);
      if (error) { toast.error(friendlyError(error.message)); return; }
      toast.success("Vehicle updated");
    } else {
      const { error } = await supabase.from("vehicles").insert({
        user_id: user!.id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        nickname: formData.nickname || null,
        chassis_code: formData.chassis_code || null,
        is_primary: !vehicles || vehicles.length === 0,
      } as any);
      setSaving(false);
      if (error) { toast.error(friendlyError(error.message)); return; }
      toast.success("Vehicle added");
    }
    setShowDialog(false);
    queryClient.invalidateQueries({ queryKey: ["garage-vehicles"] });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success("Vehicle removed");
    queryClient.invalidateQueries({ queryKey: ["garage-vehicles"] });
  };

  const handleSetPrimary = async (v: GarageVehicle) => {
    if (v.is_primary) return;
    await supabase.from("vehicles").update({ is_primary: false }).eq("user_id", user!.id);
    const { error } = await supabase.from("vehicles").update({ is_primary: true }).eq("id", v.id);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success(`${v.make} ${v.model} set as primary`);
    queryClient.invalidateQueries({ queryKey: ["garage-vehicles"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="My Garage" description="Manage your saved vehicles for personalised parts recommendations on WIBO." />
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-16 md:pb-16 pb-28">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My <span className="text-primary">Garage</span>
            </h1>
          </div>
          {user && (
            <Button onClick={openAdd} className="font-display font-semibold bg-primary text-primary-foreground hover:brightness-110">
              <Plus className="w-4 h-4 mr-2" /> Add Vehicle
            </Button>
          )}
        </div>

        {contextVehicle && (
          <div className="glass rounded-2xl p-5 mb-6 border border-primary/20">
            <p className="text-xs text-muted-foreground font-display mb-1 uppercase tracking-widest">Currently Browsing As</p>
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-primary" />
              <span className="font-display font-semibold text-foreground text-lg">
                {contextVehicle.year} {contextVehicle.make} {contextVehicle.model}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-display">Active</span>
            </div>
          </div>
        )}

        {authLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">Save Your Vehicles</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Sign in to save your garage and get personalised parts recommendations every visit.
            </p>
            <Link to="/auth">
              <Button className="font-display font-semibold bg-primary text-primary-foreground hover:brightness-110">
                Sign In to Save Your Garage
              </Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <div className="grid gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="glass-hover rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-foreground">
                        {v.year} {v.make} {v.model}
                      </span>
                      {v.is_primary && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-display">Primary</span>
                      )}
                    </div>
                    {(v.nickname || v.chassis_code) && (
                      <div className="text-sm text-muted-foreground font-display flex items-center gap-1.5 mt-0.5">
                        {v.nickname && <span>{v.nickname}</span>}
                        {v.nickname && v.chassis_code && <span className="text-muted-foreground/40">·</span>}
                        {v.chassis_code && (
                          <span className="font-mono text-xs bg-white/5 border border-white/10 px-1.5 py-0.2 rounded text-primary font-semibold">
                            {v.chassis_code}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!v.is_primary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetPrimary(v)}
                      title="Set as primary"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEdit(v)} className="font-display text-muted-foreground hover:text-foreground">
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(v)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-10 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">No Vehicles Yet</h2>
            <p className="text-muted-foreground mb-6 text-sm">Add your first vehicle to get personalised parts recommendations.</p>
            <Button onClick={openAdd} className="font-display font-semibold bg-primary text-primary-foreground hover:brightness-110">
              <Plus className="w-4 h-4 mr-2" /> Add Vehicle
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="glass border-white/10 text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Nickname (optional)"
              value={formData.nickname}
              onChange={(e) => setFormData((p) => ({ ...p, nickname: e.target.value }))}
              className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-display"
            />
            <select
              value={formData.make}
              onChange={(e) => setFormData((p) => ({ ...p, make: e.target.value, model: "" }))}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" className="bg-card">Make</option>
              {vehicleMakes.map((m) => <option key={m} value={m} className="bg-card">{m}</option>)}
            </select>
            <select
              value={formData.model}
              onChange={(e) => setFormData((p) => ({ ...p, model: e.target.value }))}
              disabled={!formData.make}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="" className="bg-card">Model</option>
              {models.map((m) => <option key={m} value={m} className="bg-card">{m}</option>)}
            </select>
            <select
              value={formData.year}
              onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" className="bg-card">Year</option>
              {vehicleYears.map((y) => <option key={y} value={y} className="bg-card">{y}</option>)}
            </select>
            <Input
              placeholder="Chassis code (optional — e.g. NZE141)"
              value={formData.chassis_code}
              onChange={(e) => setFormData((p) => ({ ...p, chassis_code: e.target.value.toUpperCase() }))}
              className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)} className="font-display">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="font-display font-semibold bg-primary text-primary-foreground hover:brightness-110">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editVehicle ? "Save Changes" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="glass border-white/10 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">Remove Vehicle?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove {deleteTarget?.year} {deleteTarget?.make} {deleteTarget?.model} from your garage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-display">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="font-display bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
      <MobileBottomBar />
    </div>
  );
};

export default Garage;
