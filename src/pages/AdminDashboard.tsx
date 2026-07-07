import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, LogOut, Loader2, Database, Package,
  TrendingUp, Users, ShoppingBag, ChevronDown, ChevronUp, Search, ExternalLink,
  MessageCircle, Wrench
} from "lucide-react";
import { SITE } from "@/config/site";
import { toast } from "sonner";
import { friendlyError } from "@/lib/errors";
import AdminProductForm from "@/components/AdminProductForm";
import type { ProductFormData } from "@/components/AdminProductForm";
import { products as staticProducts } from "@/data/products";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminTab = "overview" | "orders" | "products" | "customers" | "mechanics" | "trade";
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products?: { name: string; image_url?: string | null } | null;
  product_name?: string;
}

type ProductRow = Tables<"products">;

interface OrderRow {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number | null;
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  delivery_area?: string | null;
  order_items?: OrderItem[];
}

type CustomerRow = Tables<"profiles">;

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20   text-blue-400   border-blue-500/30",
  shipped:   "bg-purple-500/20 text-purple-400  border-purple-500/30",
  delivered: "bg-green-500/20  text-green-400   border-green-500/30",
};
const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `KSh ${n.toLocaleString("en-KE")}`;
const fmtDate = (s: string) => format(new Date(s), "d MMM yyyy");

function StatCard({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string | number; sub?: string;
  icon: React.FC<{ className?: string }>; accent?: boolean;
}) {
  return (
    <div className="glass-hover rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground font-display uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-primary/20" : "bg-white/5"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>
      <p className={`font-display text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1 font-display">{sub}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { signOut } = useAdminAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [editProduct, setEditProduct] = useState<ProductFormData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all");
  const [productSearch, setProductSearch] = useState("");

  // ── Data fetching ────────────────────────────────────────────────────────

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image_url))")
        .order("created_at", { ascending: false })
        .returns<OrderRow[]>();
      if (error) throw error;
      return (data || []) as OrderRow[];
    },
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["admin-customers"],
    enabled: activeTab === "customers",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles").select("*").order("created_at", { ascending: false })
        .returns<CustomerRow[]>();
      if (error) throw error;
      return (data || []) as CustomerRow[];
    },
  });

  const { data: mechanics = [], refetch: refetchMechanics } = useQuery({
    queryKey: ["admin-mechanics"],
    enabled: activeTab === "mechanics",
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("mechanics").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    },
  });

  const { data: tradeApplications = [], refetch: refetchTrade } = useQuery({
    queryKey: ["admin-trade"],
    enabled: activeTab === "trade",
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("trade_applications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    },
  });

  // ── Derived stats ────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!orders) return { total: 0, revenue: 0, pending: 0, delivered: 0, byStatus: {} as Record<string, number> };
    const byStatus: Record<string, number> = {};
    let revenue = 0;
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
      revenue += o.total_amount
        ?? o.order_items?.reduce((s, i) => s + i.price * i.quantity, 0)
        ?? 0;
    }
    return { total: orders.length, revenue, pending: byStatus.pending ?? 0, delivered: byStatus.delivered ?? 0, byStatus };
  }, [orders]);

  // ── Filtered lists ───────────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const matchSearch = !orderSearch || o.id.toLowerCase().includes(orderSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!productSearch) return products;
    const q = productSearch.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const toggleOrder = (id: string) =>
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success("Order updated");
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

    if (["confirmed", "shipped", "delivered"].includes(status)) {
      const order = orders?.find((o) => o.id === orderId);
      if (order?.user_id) {
        supabase.functions.invoke("notify-order-email", {
          body: {
            user_id: order.user_id,
            status,
            order_ref: order.id.slice(0, 8).toUpperCase()
          }
        }).catch(() => {});
      }
    }
  };

  const toggleMechanicVerified = async (id: string, currentVal: boolean) => {
    const { error } = await supabase.from("mechanics").update({ is_verified: !currentVal }).eq("id", id);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success("Mechanic status updated");
    refetchMechanics();
  };

  const toggleMechanicActive = async (id: string, currentVal: boolean) => {
    const { error } = await supabase.from("mechanics").update({ is_active: !currentVal }).eq("id", id);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success("Mechanic active status updated");
    refetchMechanics();
  };

  const handleTradeStatus = async (appId: string, email: string | null, phone: string, action: "approved" | "rejected") => {
    const { error } = await supabase.from("trade_applications").update({ status: action }).eq("id", appId);
    if (error) { toast.error(friendlyError(error.message)); return; }

    if (action === "approved") {
      const cleanPhone = phone.trim();
      const { data: profiles } = await supabase.from("profiles").select("id").eq("email", email || "").or(`phone.eq.${cleanPhone}`);
      const profileId = profiles?.[0]?.id;
      if (profileId) {
        await supabase.from("profiles").update({ is_trade_account: true, trade_discount_pct: 10 } as any).eq("id", profileId);
        toast.success("Trade account approved and client profile updated!");
      } else {
        toast.success("Trade account approved! (No matching profile found)");
      }
    } else {
      toast.success("Trade application rejected");
    }
    refetchTrade();
  };

  const notifyCustomer = (order: OrderRow) => {
    if (!order.customer_phone) return;
    const ref = `#${order.id.slice(0, 8).toUpperCase()}`;
    const statusMessages: Record<OrderStatus, string> = {
      pending:   `We've received your order ${ref} and it's being reviewed.`,
      confirmed: `Great news! Your order ${ref} has been confirmed and your parts are being prepared.`,
      shipped:   `Your order ${ref} is on the way! Our delivery team is heading to ${order.delivery_area ?? "you"}.`,
      delivered: `Your order ${ref} has been delivered. Thank you for choosing WIBO! 🙏`,
    };
    const msg = encodeURIComponent(
      `Hi ${order.customer_name ?? "there"}! 👋\n\n${statusMessages[order.status]}\n\nQuestions? Reply here or call us: ${SITE.phone}\n\n— WIBO Auto Parts`
    );
    const phone = order.customer_phone.replace(/\D/g, "");
    const intlPhone = phone.startsWith("0") ? `254${phone.slice(1)}` : phone;
    window.open(`https://wa.me/${intlPhone}?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success("Product deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleEdit = (p: ProductRow) => {
    setEditProduct({
      id: p.id, name: p.name, price: Number(p.price),
      image_url: p.image_url || "", category: p.category, urgency: p.urgency,
      fits: p.fits, description: p.description, oem_number: p.oem_number,
      specs: Array.isArray(p.specs) ? p.specs as ProductFormData["specs"] : [],
      fitment_vehicles: p.fitment_vehicles || [], popularity: p.popularity,
      in_stock: p.in_stock,
    });
    setShowForm(true);
  };

  const handleSeed = async () => {
    setSeeding(true);
    toast.info("Uploading images…");
    const payload: TablesInsert<"products">[] = [];
    for (let i = 0; i < staticProducts.length; i++) {
      const p = staticProducts[i];
      let image_url: string | null = null;
      try {
        const res = await fetch(p.image);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        const filename = `seed-${p.id}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(filename, blob, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);
          image_url = urlData.publicUrl;
        }
      } catch { /* continue without image */ }
      toast.info(`Uploading images… ${i + 1}/${staticProducts.length}`);
      payload.push({
        name: p.name, price: p.price, image_url, category: p.category, urgency: p.urgency,
        fits: p.fits, description: p.description, oem_number: p.oemNumber,
        specs: JSON.parse(JSON.stringify(p.specs)), fitment_vehicles: p.fitmentVehicles,
        related_ids: p.relatedIds, popularity: p.popularity, date_added: p.dateAdded,
      });
    }
    const { error } = await supabase.from("products").insert(payload);
    setSeeding(false);
    if (error) { toast.error(friendlyError(error.message)); return; }
    toast.success(`Seeded ${payload.length} products`);
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const onFormSaved = () => {
    setShowForm(false);
    setEditProduct(null);
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const TABS: { id: AdminTab; label: string }[] = [
    { id: "overview",   label: "Overview"  },
    { id: "orders",     label: "Orders"    },
    { id: "products",   label: "Products"  },
    { id: "customers",  label: "Customers" },
    { id: "mechanics",  label: "Mechanics" },
    { id: "trade",      label: "Trade Accounts" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="glass border-b border-border/50 px-4 py-4 sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <span className="font-display text-xl font-bold text-foreground">
            Admin <span className="text-primary">Dashboard</span>
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/"} className="font-display">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Site
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="font-display">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap mb-8 border-b border-border/20 pb-4">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-1.5 rounded-full text-sm font-display font-semibold border transition-all ${
                activeTab === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              {label}
              {id === "orders" && stats.pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {ordersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <>
                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Revenue" icon={TrendingUp} accent
                    value={fmt(stats.revenue)}
                    sub={`${stats.total} orders total`}
                  />
                  <StatCard
                    label="Pending Orders" icon={Package}
                    value={stats.pending}
                    sub="Awaiting confirmation"
                  />
                  <StatCard
                    label="Products" icon={ShoppingBag}
                    value={products?.length ?? "—"}
                    sub="In catalog"
                  />
                  <StatCard
                    label="Customers" icon={Users}
                    value={customers?.length ?? "—"}
                    sub="Registered accounts"
                  />
                </div>

                {/* Status breakdown */}
                <div className="glass-hover rounded-2xl p-6">
                  <h2 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                    Orders by status
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ORDER_STATUSES.map((s) => (
                      <div key={s} className={`rounded-xl p-4 border ${STATUS_COLORS[s]}`}>
                        <p className="font-display text-2xl font-bold">{stats.byStatus[s] ?? 0}</p>
                        <p className="text-xs font-display capitalize mt-0.5 opacity-80">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent orders */}
                <div className="glass-hover rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
                    <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Recent orders</h2>
                    <button onClick={() => setActiveTab("orders")} className="text-xs text-primary font-display hover:underline">
                      View all →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/20">
                          <th className="text-left px-5 py-3 font-display font-semibold text-muted-foreground text-xs">Order</th>
                          <th className="text-left px-5 py-3 font-display font-semibold text-muted-foreground text-xs">Date</th>
                          <th className="text-right px-5 py-3 font-display font-semibold text-muted-foreground text-xs">Total</th>
                          <th className="text-center px-5 py-3 font-display font-semibold text-muted-foreground text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(orders ?? []).slice(0, 8).map((o) => {
                          const total = o.total_amount ?? o.order_items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
                          return (
                            <tr key={o.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                              <td className="px-5 py-3 font-display font-semibold text-foreground text-xs">
                                #{o.id.slice(0, 8).toUpperCase()}
                              </td>
                              <td className="px-5 py-3 text-muted-foreground font-display text-xs">{fmtDate(o.created_at)}</td>
                              <td className="px-5 py-3 text-right font-display font-semibold text-primary text-xs">{fmt(total)}</td>
                              <td className="px-5 py-3 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-display font-semibold ${STATUS_COLORS[o.status] ?? ""}`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {(orders ?? []).length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-10 text-muted-foreground font-display text-sm">No orders yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ORDERS ──────────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID…"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50 font-display"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", ...ORDER_STATUSES] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setOrderStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold border transition-all ${
                      orderStatusFilter === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    }`}
                  >
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    {s !== "all" && stats.byStatus[s] ? ` (${stats.byStatus[s]})` : ""}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-display">
              Showing {filteredOrders.length} of {orders?.length ?? 0} orders
            </p>

            {ordersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-display">No orders found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => {
                  const isOpen = expandedOrders.has(order.id);
                  const total = order.total_amount ?? order.order_items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
                  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
                  return (
                    <div key={order.id} className="glass-hover rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Expand toggle */}
                        <button
                          onClick={() => toggleOrder(order.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                          aria-label="Toggle order details"
                        >
                          {isOpen
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                          <div>
                            <p className="font-display font-semibold text-foreground text-sm">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground font-display">{fmtDate(order.created_at)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground font-display hidden sm:block">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </p>
                          <p className="font-display font-semibold text-primary text-sm">{fmt(total)}</p>
                          <div className="flex items-center gap-2 justify-end">
                            <Select
                              value={order.status}
                              onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                            >
                              <SelectTrigger className={`w-36 text-xs border font-display font-semibold ${STATUS_COLORS[order.status] ?? ""}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ORDER_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s} className="font-display text-xs capitalize">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {order.customer_phone && (
                              <Button
                                variant="ghost" size="icon"
                                title={`Notify ${order.customer_name ?? "customer"} on WhatsApp`}
                                onClick={() => notifyCustomer(order)}
                                className="text-green-500 hover:text-green-400 flex-shrink-0"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded: line items */}
                      {isOpen && (
                        <div className="border-t border-border/20 px-5 pb-4">
                          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mt-3 mb-2">Items</p>
                          {order.order_items && order.order_items.length > 0 ? (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border/10">
                                  <th className="text-left py-1.5 font-display font-semibold text-muted-foreground">Product</th>
                                  <th className="text-center py-1.5 font-display font-semibold text-muted-foreground">Qty</th>
                                  <th className="text-right py-1.5 font-display font-semibold text-muted-foreground">Unit</th>
                                  <th className="text-right py-1.5 font-display font-semibold text-muted-foreground">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.order_items.map((item) => (
                                  <tr key={item.id} className="border-b border-border/5">
                                    <td className="py-1.5 font-display text-foreground">
                                      <div className="flex items-center gap-2">
                                        {item.products?.image_url ? (
                                          <img
                                            src={item.products.image_url}
                                            alt={item.products.name ?? ""}
                                            className="w-8 h-8 rounded object-cover border border-white/10 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded bg-white/5 border border-white/10 shrink-0" />
                                        )}
                                        <span>{item.products?.name ?? item.product_name ?? "—"}</span>
                                      </div>
                                    </td>
                                    <td className="py-1.5 text-center text-muted-foreground font-display">{item.quantity}</td>
                                    <td className="py-1.5 text-right text-muted-foreground font-display">{fmt(item.price)}</td>
                                    <td className="py-1.5 text-right font-display font-semibold text-primary">
                                      {fmt(item.price * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={3} className="pt-2 text-right font-display font-semibold text-muted-foreground">Total</td>
                                  <td className="pt-2 text-right font-display font-bold text-primary">{fmt(total)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          ) : (
                            <p className="text-xs text-muted-foreground font-display">No items recorded.</p>
                          )}
                          <p className="text-xs text-muted-foreground font-display mt-3">
                            Customer ID: <span className="font-mono">{order.user_id}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ────────────────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50 font-display"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {products?.length === 0 && (
                  <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding} className="font-display">
                    <Database className="w-4 h-4 mr-1" />
                    {seeding ? "Seeding…" : "Seed Sample Data"}
                  </Button>
                )}
                <Button size="sm" onClick={() => { setEditProduct(null); setShowForm(true); }} className="font-display font-semibold">
                  <Plus className="w-4 h-4 mr-1" /> Add Product
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-display">
              Showing {filteredProducts.length} of {products?.length ?? 0} products
            </p>

            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="glass-hover rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Image</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Category</th>
                        <th className="text-right px-4 py-3 font-display font-semibold text-muted-foreground">Price</th>
                        <th className="text-center px-4 py-3 font-display font-semibold text-muted-foreground">Pop.</th>
                        <th className="text-center px-4 py-3 font-display font-semibold text-muted-foreground">Fits</th>
                        <th className="text-right px-4 py-3 font-display font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            {p.image_url
                              ? <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              : <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">—</div>
                            }
                          </td>
                          <td className="px-4 py-3 font-display font-medium text-foreground max-w-[180px] truncate">{p.name}</td>
                          <td className="px-4 py-3 text-muted-foreground font-display text-xs">{p.category}</td>
                          <td className="px-4 py-3 text-right font-display font-semibold text-primary">{fmt(Number(p.price))}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-display text-muted-foreground">{p.popularity ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">{p.fits ? "✅" : "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} title="Edit">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} title="Delete">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-muted-foreground font-display">
                            {productSearch ? "No products match your search." : "No products yet. Add one or seed sample data."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOMERS ───────────────────────────────────────────────────── */}
        {activeTab === "customers" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-display">
              {customers?.length ?? 0} registered customers
            </p>

            {customersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !customers || customers.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-display">No registered customers yet.</p>
              </div>
            ) : (
              <div className="glass-hover rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Email</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Joined</th>
                        <th className="text-right px-4 py-3 font-display font-semibold text-muted-foreground">Orders</th>
                        <th className="text-right px-4 py-3 font-display font-semibold text-muted-foreground">Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => {
                        const customerOrders = (orders ?? []).filter(
                          (o) => o.user_id === c.auth_id
                        );
                        const spent = customerOrders.reduce(
                          (s, o) => s + (o.total_amount ?? o.order_items?.reduce((a, i) => a + i.price * i.quantity, 0) ?? 0),
                          0
                        );
                        return (
                          <tr key={c.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-display font-medium text-foreground">
                              {c.name ?? <span className="text-muted-foreground italic">No name</span>}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-display text-xs">{c.email ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground font-display text-xs">{fmtDate(c.created_at)}</td>
                            <td className="px-4 py-3 text-right font-display text-foreground">{customerOrders.length}</td>
                            <td className="px-4 py-3 text-right font-display font-semibold text-primary">
                              {spent > 0 ? fmt(spent) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MECHANICS ───────────────────────────────────────────────────── */}
        {activeTab === "mechanics" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-display">
                {mechanics.length} mechanics onboarded
              </p>
              <Button
                size="sm"
                onClick={() => {
                  const name = prompt("Enter mechanic name:");
                  const area = prompt("Enter area (e.g. Westlands, Karen):");
                  const phone = prompt("Enter phone number:");
                  if (name && area && phone) {
                    supabase
                      .from("mechanics")
                      .insert({ name, area, phone, specialisations: [] })
                      .then(({ error }) => {
                        if (error) {
                          toast.error(friendlyError(error.message));
                        } else {
                          toast.success("Mechanic added!");
                          refetchMechanics();
                        }
                      });
                  }
                }}
                className="font-display"
              >
                Add Mechanic
              </Button>
            </div>

            {mechanics.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-display">No mechanics found or table not migrated yet.</p>
              </div>
            ) : (
              <div className="glass-hover rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Area</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Phone</th>
                        <th className="text-center px-4 py-3 font-display font-semibold text-muted-foreground">Verified</th>
                        <th className="text-center px-4 py-3 font-display font-semibold text-muted-foreground">Active</th>
                        <th className="text-right px-4 py-3 font-display font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mechanics.map((m: any) => (
                        <tr key={m.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-display font-medium text-foreground">{m.name}</td>
                          <td className="px-4 py-3 text-muted-foreground font-display text-xs">{m.area}</td>
                          <td className="px-4 py-3 text-muted-foreground font-display text-xs">{m.phone}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={m.is_verified}
                              onChange={() => toggleMechanicVerified(m.id, m.is_verified)}
                              className="rounded bg-white/10 border-white/20 text-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={m.is_active}
                              onChange={() => toggleMechanicActive(m.id, m.is_active)}
                              className="rounded bg-white/10 border-white/20 text-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive font-display text-xs"
                              onClick={async () => {
                                if (confirm("Delete this mechanic?")) {
                                  await supabase.from("mechanics").delete().eq("id", m.id);
                                  toast.success("Mechanic deleted");
                                  refetchMechanics();
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TRADE APPLICATIONS ───────────────────────────────────────────── */}
        {activeTab === "trade" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-display">
              {tradeApplications.length} trade account applications
            </p>

            {tradeApplications.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-display">No applications found or table not migrated yet.</p>
              </div>
            ) : (
              <div className="glass-hover rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Business</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Contact</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Phone</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Location</th>
                        <th className="text-left px-4 py-3 font-display font-semibold text-muted-foreground">Fleet</th>
                        <th className="text-center px-4 py-3 font-display font-semibold text-muted-foreground">Status</th>
                        <th className="text-right px-4 py-3 font-display font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeApplications.map((t: any) => (
                        <tr key={t.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-display font-medium text-foreground">
                            {t.business_name}
                            {t.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{t.notes}"</p>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-display text-xs">
                            {t.contact_name}
                            {t.email && <p className="text-[10px] text-muted-foreground">{t.email}</p>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-display text-xs">{t.phone}</td>
                          <td className="px-4 py-3 text-muted-foreground font-display text-xs">{t.location}</td>
                          <td className="px-4 py-3 text-muted-foreground font-display text-xs">{t.fleet_size || "—"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border ${
                              t.status === "approved" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                              t.status === "rejected" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {t.status === "pending" && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white font-display text-xs"
                                  onClick={() => handleTradeStatus(t.id, t.email, t.phone, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive font-display text-xs"
                                  onClick={() => handleTradeStatus(t.id, t.email, t.phone, "rejected")}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product form modal */}
      {showForm && (
        <AdminProductForm
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSaved={onFormSaved}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
