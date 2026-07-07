import { PackageSearch, ShieldCheck, Truck } from "lucide-react";

const LoadingPage = () => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
    <div className="w-full max-w-md text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_40px_hsl(var(--primary)/0.18)]">
        <PackageSearch className="h-9 w-9 text-primary animate-pulse" />
      </div>

      <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/90">
        WIBO Parts Hub
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
        Preparing genuine parts
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Checking fitment, stock, and secure checkout before the page opens.
      </p>

      <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 rounded-full bg-primary animate-[slide-in-right_1.2s_ease-in-out_infinite_alternate]" />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
          <ShieldCheck className="mx-auto mb-2 h-4 w-4 text-primary" />
          Safe
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
          <PackageSearch className="mx-auto mb-2 h-4 w-4 text-primary" />
          Matched
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3">
          <Truck className="mx-auto mb-2 h-4 w-4 text-primary" />
          Ready
        </div>
      </div>
    </div>
  </div>
);

export default LoadingPage;
