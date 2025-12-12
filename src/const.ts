export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const COMPANY = {
  name: "Car Sales Platform",
  vat: "PT000000000",
  address: "Rua Exemplo 123",
  city: "Lisboa",
  country: "Portugal",
  email: "info@example.com",
  phone: "+351 000 000 000",
  socials: {
    instagram: "#",
    facebook: "#",
    linkedin: "#",
  },
  links: [
    { label: "Cars", href: "/" },
    { label: "About", href: "/presentation" },
    { label: "Partners", href: "/partners" },
  ],
} as const;
