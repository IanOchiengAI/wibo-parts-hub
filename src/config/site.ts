const readEnv = (key: string, fallback: string) => {
  const value = import.meta.env[key] as string | undefined;
  return value?.trim() || fallback;
};

export const SITE = {
  phone: readEnv("VITE_SITE_PHONE", "+254700000000"),
  whatsapp: readEnv("VITE_SITE_WHATSAPP", "254700000000"),
  email: readEnv("VITE_SITE_EMAIL", "hello@wibo.co.ke"),
  address: readEnv("VITE_SITE_ADDRESS", "Nairobi, Kenya"),
  url: readEnv("VITE_SITE_URL", "https://wibo.co.ke"),
} as const;
