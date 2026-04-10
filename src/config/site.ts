export const MIXING_STANDARD_PRICE = 99;
export const MIXING_PREMIUM_PRICE = 199;

export const siteConfig = {
  name: "Studio Platform",
  description: "Recording studio platform — Sessions, Beats & Mixing",
  url: "https://studioplatform.test",
  locale: "fr-FR",
  socials: {
    instagram: "https://instagram.com/studioplatform",
    tiktok: "https://tiktok.com/@studioplatform",
  },
  contact: {
    email: "contact@studioplatform.test",
    phone: "00 00 00 00 00",
    address: "Demo Address",
  },
} as const;

export const navItems = {
  mobile: [
    { href: "/", label: "Accueil", icon: "home" },
    { href: "/beats", label: "Prods", icon: "music" },
    { href: "/booking", label: "Réserver", icon: "calendar" },
    { href: "/mixing", label: "Mixage", icon: "sliders" },
    { href: "/account", label: "Compte", icon: "user" },
  ],
  desktop: [
    { href: "/", label: "Accueil" },
    { href: "/beats", label: "Prods" },
    { href: "/booking", label: "Réserver" },
    { href: "/mixing", label: "Mixage" },
    { href: "/#about", label: "À propos" },
    { href: "/#contact", label: "Contact" },
  ],
} as const;
