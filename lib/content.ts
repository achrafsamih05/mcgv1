/**
 * Centralized content dictionary.
 *
 * i18n-READY: All visible strings live here under a locale key. To add Arabic
 * or French later, duplicate the `en` object as `ar` / `fr`, translate the
 * values, and select the active locale (e.g. from the URL segment or a cookie).
 * For Arabic, also set <html dir="rtl"> in app/layout.tsx.
 */

export type Locale = "en" | "ar" | "fr";

export const WHATSAPP_NUMBER = "212600000000"; // placeholder — replace with real number
export const SUPPORT_EMAIL = "support@mcg-global.com";

export const whatsappLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

export const content = {
  en: {
    nav: {
      links: [
        { label: "Home", href: "#home" },
        { label: "Suppliers", href: "#suppliers" },
        { label: "Products", href: "#categories" },
        { label: "Warehouses", href: "#warehouses" },
        { label: "Drivers", href: "#transport" },
      ],
      cta: "List Your Business",
    },
    hero: {
      eyebrow: "All-in-one trade & logistics ecosystem",
      title: "Import from China Made Easy",
      subtitle:
        "Connect with trusted suppliers, warehouses, drivers, and logistics services in one powerful platform.",
      requestProduct: "Request Product",
      findSupplier: "Find Supplier",
      whatsapp: "Contact WhatsApp",
    },
    search: {
      placeholder: "Search products, suppliers, warehouses or drivers...",
      button: "Search",
      types: ["Products", "Suppliers", "Warehouses", "Drivers"],
      popular: "Popular:",
      popularItems: ["Excavator", "Guangzhou Suppliers", "Warehouse Casablanca", "Truck Driver Agadir"],
    },
    categories: {
      title: "Popular Import Categories",
      description:
        "Explore the most requested import categories from trusted suppliers.",
    },
    suppliers: {
      title: "Featured Suppliers",
      description: "Verified manufacturing partners across China.",
      viewProfile: "View Profile",
      contact: "Contact Supplier",
      experience: "yrs experience",
    },
    transport: {
      title: "Transport & Delivery Services",
      description: "The right fleet for every shipment size and speed.",
    },
    warehouses: {
      title: "Warehouse Solutions",
      description: "Flexible storage space close to your markets.",
      view: "View Warehouse",
      book: "Book Now",
    },
    how: {
      title: "How MCG Global Works",
      description: "From sourcing to delivery in four simple steps.",
    },
    stats: {
      title: "Trusted by a growing global network",
    },
    testimonials: {
      title: "What Our Partners Say",
      description: "Cross-border success stories from our community.",
    },
    contact: {
      title: "Need Help?",
      description: "Our trade specialists respond within one business hour.",
      whatsappTitle: "Chat on WhatsApp",
      whatsappDesc: "Fastest way to reach our team.",
      emailTitle: "Email Us",
      emailDesc: "Detailed quotes and documentation.",
      formName: "Full name",
      formEmail: "Email address",
      formMessage: "How can we help?",
      formSubmit: "Send Message",
    },
    footer: {
      tagline:
        "Your complete trade & logistics ecosystem — connecting importers with the partners that move the world.",
      columns: [
        {
          title: "Quick Links",
          links: ["Home", "Suppliers", "Products", "Warehouses", "Drivers"],
        },
        {
          title: "Services",
          links: ["Import Services", "Logistics", "Warehousing", "Transportation"],
        },
        {
          title: "Company",
          links: ["About Us", "Contact Us", "Privacy Policy", "Terms & Conditions"],
        },
      ],
      rights: "All rights reserved.",
    },
  },
} satisfies Record<string, unknown>;

export type Content = (typeof content)["en"];
