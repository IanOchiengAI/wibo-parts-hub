import { MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/config/site";

const MobileBottomBar = () => (
  <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-white/10 p-3 flex gap-3">
    <a
      href={`https://wa.me/${SITE.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white font-display font-semibold text-sm hover:bg-green-700 transition-colors"
    >
      <MessageCircle className="w-4 h-4" /> WhatsApp Us
    </a>
    <a
      href={`tel:${SITE.phone}`}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:brightness-110 transition-all"
    >
      <Phone className="w-4 h-4" /> Call
    </a>
  </div>
);

export default MobileBottomBar;
