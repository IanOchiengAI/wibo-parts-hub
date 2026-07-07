import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/errors";
import { categories } from "@/data/products";

export interface ProductFormData {
  id?: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  urgency: string;
  fits: boolean;
  in_stock: boolean;
  description: string;
  oem_number: string;
  specs: { label: string; value: string }[];
  fitment_vehicles: string[];
  popularity: number;
  quality_tier: "genuine" | "oem" | "aftermarket" | "ex-japan";
}

interface AdminProductFormProps {
  product?: ProductFormData | null;
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm: ProductFormData = {
  name: "",
  price: 0,
  image_url: "",
  category: categories[0]?.name || "",
  urgency: "Order now, delivered by 6PM",
  fits: false,
  in_stock: true,
  description: "",
  oem_number: "N/A",
  specs: [{ label: "", value: "" }],
  fitment_vehicles: [""],
  popularity: 50,
  quality_tier: "oem",
};

const AdminProductForm = ({ product, onClose, onSaved }: AdminProductFormProps) => {
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm, ...product });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    const header = await file.slice(0, 12).arrayBuffer();
    const b = new Uint8Array(header);
    const isJpeg = b[0] === 0xFF && b[1] === 0xD8;
    const isPng  = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47;
    const isWebP = b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
    const isGif  = b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46;
    if (!isJpeg && !isPng && !isWebP && !isGif) {
      toast.error("File must be a valid image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    const ext = isJpeg ? "jpg" : isPng ? "png" : isWebP ? "webp" : "gif";
    const path = `${crypto.randomUUID()}.${ext}`;

    setUploading(true);
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(friendlyError(error.message));
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    update("image_url", urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = async () => {
    if (!form.name || !form.category || form.price <= 0) {
      toast.error("Please fill in name, category, and a valid price.");
      return;
    }
    setSaving(true);

    const payload: any = {
      name: form.name,
      price: form.price,
      image_url: form.image_url || null,
      category: form.category,
      urgency: form.urgency,
      fits: form.fits,
      in_stock: form.in_stock,
      description: form.description,
      oem_number: form.oem_number,
      specs: JSON.parse(JSON.stringify(form.specs.filter((s) => s.label && s.value))),
      fitment_vehicles: form.fitment_vehicles.filter(Boolean),
      popularity: form.popularity,
      quality_tier: form.quality_tier,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from("products").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error(friendlyError(error.message));
      return;
    }
    toast.success(form.id ? "Product updated" : "Product created");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="glass-hover rounded-2xl p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-xl font-bold text-foreground mb-6">
          {form.id ? "Edit" : "Add"} Product
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground font-display mb-1 block">Name *</label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} className="bg-background/50 border-border/50" />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-display mb-1 block">Price (KSh) *</label>
              <Input type="number" value={form.price} onChange={(e) => update("price", Number(e.target.value))} className="bg-background/50 border-border/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display mb-1 block">Category *</label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality Tier */}
          <div>
            <label className="text-xs text-muted-foreground font-display mb-1 block">Part Quality *</label>
            <Select value={form.quality_tier} onValueChange={(v) => update("quality_tier", v as any)}>
              <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="genuine">Genuine (OEM manufacturer)</SelectItem>
                <SelectItem value="oem">OEM Equivalent</SelectItem>
                <SelectItem value="aftermarket">Aftermarket</SelectItem>
                <SelectItem value="ex-japan">Ex-Japan (Used)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image */}
          <div>
            <label className="text-xs text-muted-foreground font-display mb-1 block">Image</label>
            <div className="flex gap-2 items-center">
              <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="URL or upload" className="bg-background/50 border-border/50 flex-1" />
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button variant="outline" size="icon" asChild disabled={uploading}>
                  <span><Upload className="w-4 h-4" /></span>
                </Button>
              </label>
            </div>
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-20 rounded-lg object-cover" />}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground font-display mb-1 block">Description</label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="bg-background/50 border-border/50" rows={3} />
          </div>

          {/* Urgency + OEM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-display mb-1 block">Urgency</label>
              <Input value={form.urgency} onChange={(e) => update("urgency", e.target.value)} className="bg-background/50 border-border/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display mb-1 block">OEM Number</label>
              <Input value={form.oem_number} onChange={(e) => update("oem_number", e.target.value)} className="bg-background/50 border-border/50" />
            </div>
          </div>

          {/* In Stock + Fits + Popularity */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch checked={form.in_stock} onCheckedChange={(v) => update("in_stock", v)} />
              <span className="text-sm text-muted-foreground font-display">In Stock</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.fits} onCheckedChange={(v) => update("fits", v)} />
              <span className="text-sm text-muted-foreground font-display">Fits customer car</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground font-display">Popularity</label>
              <Input type="number" value={form.popularity} onChange={(e) => update("popularity", Number(e.target.value))} className="w-20 bg-background/50 border-border/50" />
            </div>
          </div>

          {/* Specs */}
          <div>
            <label className="text-xs text-muted-foreground font-display mb-1 block">Specs</label>
            {form.specs.map((spec, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input placeholder="Label" value={spec.label} onChange={(e) => {
                  const s = [...form.specs]; s[i] = { ...s[i], label: e.target.value }; update("specs", s);
                }} className="bg-background/50 border-border/50" />
                <Input placeholder="Value" value={spec.value} onChange={(e) => {
                  const s = [...form.specs]; s[i] = { ...s[i], value: e.target.value }; update("specs", s);
                }} className="bg-background/50 border-border/50" />
                <Button variant="ghost" size="icon" onClick={() => {
                  update("specs", form.specs.filter((_, j) => j !== i));
                }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update("specs", [...form.specs, { label: "", value: "" }])}>
              <Plus className="w-3 h-3 mr-1" /> Add Spec
            </Button>
          </div>

          {/* Fitment Vehicles */}
          <div>
            <label className="text-xs text-muted-foreground font-display mb-1 block">Fitment Vehicles</label>
            {form.fitment_vehicles.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input value={v} onChange={(e) => {
                  const arr = [...form.fitment_vehicles]; arr[i] = e.target.value; update("fitment_vehicles", arr);
                }} className="bg-background/50 border-border/50" />
                <Button variant="ghost" size="icon" onClick={() => {
                  update("fitment_vehicles", form.fitment_vehicles.filter((_, j) => j !== i));
                }}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update("fitment_vehicles", [...form.fitment_vehicles, ""])}>
              <Plus className="w-3 h-3 mr-1" /> Add Vehicle
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1 font-display font-semibold">
              {saving ? "Saving..." : form.id ? "Update Product" : "Create Product"}
            </Button>
            <Button variant="outline" onClick={onClose} className="font-display">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
