import { Link } from "react-router-dom";
import { ShoppingCart, Car, Package, LayoutDashboard, ShieldCheck, Wrench } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useVehicle } from "@/context/VehicleContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const Navbar = () => {
  const { totalItems, toggleCart } = useCart();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { vehicle } = useVehicle();

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email
    ? user.email[0].toUpperCase()
    : "?";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="font-display text-2xl font-bold text-primary">WIBO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {[
            { label: "Parts", id: "parts" },
            { label: "Categories", id: "categories" },
            { label: "Ask Boni AI", id: "ask-boni-ai" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="text-sm text-foreground/70 hover:text-primary transition-colors font-display"
            >
              {label}
            </button>
          ))}

          <Link
            to="/garage"
            className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors font-display"
          >
            <Car className="w-4 h-4" />
            {vehicle ? (
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                {vehicle.make} {vehicle.model}
              </span>
            ) : (
              <span>My Garage</span>
            )}
          </Link>

          <Link
            to="/mechanics"
            className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors font-display"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden lg:inline">Find Mechanic</span>
          </Link>

          <Link
            to="/orders"
            className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors font-display"
          >
            <Package className="w-4 h-4" />
            <span className="hidden lg:inline">Orders</span>
          </Link>

          {user && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors font-display"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>My WIBO</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors font-display"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 glass-hover rounded-lg px-2 py-1 transition-all"
                  title="Account menu"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-display font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-xs text-muted-foreground font-display">Account</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 font-display glass border-white/10" style={{ background: "hsla(220, 60%, 6%, 0.95)" }}>
                <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer text-foreground hover:text-primary">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/garage" className="cursor-pointer text-foreground hover:text-primary">My Garage</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer text-foreground hover:text-primary">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive cursor-pointer focus:text-destructive hover:bg-destructive/10"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-display font-semibold hover:brightness-110 transition-all"
            >
              Sign In
            </Link>
          )}

          <div className="md:hidden flex items-center gap-3 ml-2">
            {user && (
              <Link to="/dashboard" className="p-2 glass-hover rounded-lg" aria-label="My WIBO Dashboard">
                <LayoutDashboard className="w-4 h-4 text-foreground" />
              </Link>
            )}
            <Link to="/garage" className="p-2 glass-hover rounded-lg" aria-label="Garage">
              <Car className="w-4 h-4 text-foreground" />
            </Link>
            <Link to="/orders" className="p-2 glass-hover rounded-lg" aria-label="Orders">
              <Package className="w-4 h-4 text-foreground" />
            </Link>
          </div>

          <button onClick={toggleCart} className="relative p-2 glass-hover rounded-lg" aria-label="Open cart">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
