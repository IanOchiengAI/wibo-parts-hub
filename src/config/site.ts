const readEnv = (key: string, fallback: string) => {
  const value = import.meta.env[key] as string | undefined;
  return value?.trim() || fallback;
};

export const SITE = {
  phone: readEnv("VITE_SITE_PHONE", "+254 702 165056"),
  whatsapp: readEnv("VITE_SITE_WHATSAPP", "254702165056"),
  whatsappCatalogue: readEnv("VITE_SITE_WHATSAPP_CATALOGUE", "https://wa.me/c/182308543922219"),
  email: readEnv("VITE_SITE_EMAIL", "hello@wibo.co.ke"),
  address: readEnv("VITE_SITE_ADDRESS", "Nairobi, Kenya"),
  url: readEnv("VITE_SITE_URL", "https://wibo.co.ke"),
  tagline: "One stop shop for auto body & suspension parts. Both new and genuine ex Japan.",
} as const;
