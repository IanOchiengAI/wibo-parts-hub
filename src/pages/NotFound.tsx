import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Home, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_40px_hsl(var(--primary)/0.16)]">
          <PackageSearch className="h-9 w-9 text-primary" />
        </div>

        <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/90">
          WIBO Parts Hub
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold text-foreground">
          404
        </h1>
        <p className="mt-4 text-lg font-semibold text-foreground">
          We could not find that part of the site.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The address <span className="text-foreground">{location.pathname}</span> is not available. Search the catalog or return to the main parts hub.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/search">
              <ArrowLeft className="h-4 w-4" />
              Search parts
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
