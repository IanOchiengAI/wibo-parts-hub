import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative">
      <div className="flex items-center bg-card border rounded-xl px-5 py-4 gap-3 hover:border-accent/50 transition-colors cursor-text">
        <Search className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground text-sm flex-1">
          What part do you need?
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
          /
        </kbd>
      </div>
    </div>
  );
}
