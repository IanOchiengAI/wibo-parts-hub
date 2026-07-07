import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/data/products";
import type { Json } from "@/integrations/supabase/types";

type ProductSpec = { label: string; value: string };

const isProductSpecArray = (specs: Json): specs is ProductSpec[] =>
  Array.isArray(specs) &&
  specs.every(
    (spec) =>
      typeof spec === "object" &&
      spec !== null &&
      !Array.isArray(spec) &&
      typeof spec.label === "string" &&
      typeof spec.value === "string",
  );

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        return staticProducts;
      }

      return data.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image_url || "",
        category: p.category,
        urgency: p.urgency,
        fits: p.fits,
        inStock: p.in_stock ?? true,
        description: p.description,
        oemNumber: p.oem_number,
        specs: isProductSpecArray(p.specs) ? p.specs : [],
        fitmentVehicles: p.fitment_vehicles || [],
        relatedIds: p.related_ids || [],
        popularity: p.popularity,
        dateAdded: p.date_added,
        quality_tier: ((p as any).quality_tier as Product["quality_tier"]) ?? "oem",
      }));
    },
  });
};
