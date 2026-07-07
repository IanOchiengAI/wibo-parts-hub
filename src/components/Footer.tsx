import { Link } from "react-router-dom";
import { MessageCircle, BookOpen } from "lucide-react";
import { SITE } from "@/config/site";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const Footer = () => (
  <footer className="glass border-t border-white/10 py-12 px-4">
    <div className="container mx-auto max-w-5xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        <div>
          <span className="font-display text-2xl font-bold text-primary">WIBO</span>
          <p className="text-sm text-muted-foreground mt-2">{SITE.tagline}</p>
          <div className="flex flex-col gap-2 mt-4">
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors font-display font-semibold"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
            <a
              href={SITE.whatsappCatalogue}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors font-display font-semibold"
            >
              <BookOpen className="w-4 h-4" /> Browse Catalogue
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <button onClick={() => scrollTo("parts")} className="hover:text-primary transition-colors font-display text-left">
                Parts Catalog
              </button>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary transition-colors font-display">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-primary transition-colors font-display">
                My Account
              </Link>
            </li>
            <li>
              <Link to="/mechanics" className="hover:text-primary transition-colors font-display">
                Find a Mechanic
              </Link>
            </li>
            <li>
              <Link to="/trade" className="hover:text-primary transition-colors font-display">
                Trade Account
              </Link>
            </li>
            <li>
              <button onClick={() => scrollTo("categories")} className="hover:text-primary transition-colors font-display text-left">
                Browse Categories
              </button>
            </li>
            <li>
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=Hi%20WIBO!%20I'd%20like%20to%20return%20a%20part.`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors font-display"
              >
                Returns
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={`tel:${SITE.phone}`} className="hover:text-primary transition-colors">{SITE.phone}</a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-primary transition-colors">{SITE.email}</a>
            </li>
            <li>{SITE.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} <span className="text-primary font-display font-semibold">WIBO</span>. All rights reserved.</span>
        <span className="flex items-center gap-1.5 group">
          <span className="inline-block w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
          <span className="group-hover:text-foreground transition-colors">
            Designed &amp; built by{" "}
            <span className="text-primary font-display font-semibold tracking-wide">
              Kasuku Studios
            </span>
          </span>
          <span className="inline-block w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
