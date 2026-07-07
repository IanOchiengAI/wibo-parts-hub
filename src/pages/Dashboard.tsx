import { Navigate } from "react-router-dom";
import { LayoutDashboard, Search, Car, Package, MessageCircle, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import PageHead from "@/components/PageHead";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { VehicleSelector } from "@/components/dashboard/VehicleSelector";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { ProductCarousel } from "@/components/dashboard/ProductCarousel";
import { BoniAI } from "@/components/dashboard/BoniAI";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { SITE } from "@/config/site";

const QUICK_ACTIONS = [
  { label: "Find Parts",      icon: Search,       to: "/",              color: "bg-primary/10 text-primary hover:bg-primary/20" },
  { label: "My Garage",       icon: Car,          to: "/garage",        color: "bg-accent/10  text-accent  hover:bg-accent/20"  },
  { label: "My Orders",       icon: Package,      to: "/orders",        color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" },
  { label: "Track Order",     icon: Truck,        to: "/track",         color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" },
];

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen">
      <PageHead title="My WIBO — Dashboard" />
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 pt-24 pb-32 md:pb-16 space-y-8">

        {/* Welcome */}
        <WelcomeCard />

        {/* Quick Actions */}
        <section>
          <h2 className="font-display font-semibold text-base text-muted-foreground uppercase tracking-widest mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-display font-semibold">{action.label}</span>
              </Link>
            ))}
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors col-span-2 sm:col-span-1"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-display font-semibold">WhatsApp Us</span>
            </a>
          </div>
        </section>

        {/* Vehicle + Boni AI — two column on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VehicleSelector />
          <BoniAI />
        </div>

        {/* Search Bar */}
        <Link to="/" className="block">
          <SearchBar />
        </Link>

        {/* Recommended parts */}
        <ProductCarousel title="Recommended for Your Vehicle" />
        <ProductCarousel title="Popular in Nairobi This Week" showSocialProof />

        {/* Recent orders */}
        <RecentOrders />

      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
