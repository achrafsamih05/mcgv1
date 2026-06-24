/**
 * Static demo data for the home page. In production this would be fetched
 * from the API / CMS. Icons are referenced by name and mapped to Lucide
 * components in the consuming component (no emojis used as UI icons).
 */

export type Category = {
  id: string;
  name: string;
  description: string;
  cta: string;
  icon: "car" | "tractor" | "factory" | "shirt" | "armchair" | "laptop";
  href: string;
};

export const categories: Category[] = [
  {
    id: "cars",
    name: "Cars & Vehicles",
    description: "Import cars and vehicles directly from verified suppliers.",
    cta: "Explore Cars",
    icon: "car",
    href: "#",
  },
  {
    id: "equipment",
    name: "Heavy Equipment",
    description: "Construction and industrial machinery from China.",
    cta: "Explore Equipment",
    icon: "tractor",
    href: "#",
  },
  {
    id: "machines",
    name: "Industrial Machines",
    description: "Production and manufacturing equipment.",
    cta: "Explore Machines",
    icon: "factory",
    href: "#",
  },
  {
    id: "fashion",
    name: "Clothing & Fashion",
    description: "Clothes, shoes and fashion accessories.",
    cta: "Explore Fashion",
    icon: "shirt",
    href: "#",
  },
  {
    id: "furniture",
    name: "Furniture",
    description: "Home, office and commercial furniture.",
    cta: "Explore Furniture",
    icon: "armchair",
    href: "#",
  },
  {
    id: "electronics",
    name: "Electronics",
    description: "Electronic devices and technology products.",
    cta: "Explore Electronics",
    icon: "laptop",
    href: "#",
  },
];

export type Supplier = {
  id: string;
  name: string;
  country: string;
  flag: string;
  specialization: string;
  rating: number;
  reviews: number;
  years: number;
};

export const suppliers: Supplier[] = [
  {
    id: "s1",
    name: "Guangzhou AutoParts Co.",
    country: "China",
    flag: "🇨🇳",
    specialization: "Vehicles & Spare Parts",
    rating: 4.9,
    reviews: 1280,
    years: 14,
  },
  {
    id: "s2",
    name: "Shenzhen TechWorks",
    country: "China",
    flag: "🇨🇳",
    specialization: "Consumer Electronics",
    rating: 4.8,
    reviews: 2045,
    years: 11,
  },
  {
    id: "s3",
    name: "Foshan Home & Living",
    country: "China",
    flag: "🇨🇳",
    specialization: "Furniture & Décor",
    rating: 4.7,
    reviews: 890,
    years: 9,
  },
  {
    id: "s4",
    name: "Jinan Heavy Machinery",
    country: "China",
    flag: "🇨🇳",
    specialization: "Construction Equipment",
    rating: 4.9,
    reviews: 654,
    years: 18,
  },
];

export type FleetOption = {
  id: string;
  name: string;
  description: string;
  capacity: string;
  icon: "truck" | "van" | "car" | "bike";
};

export const fleet: FleetOption[] = [
  {
    id: "truck",
    name: "Truck",
    description: "Heavy cargo transport for bulk and oversized freight.",
    capacity: "Up to 25 tons",
    icon: "truck",
  },
  {
    id: "van",
    name: "Van",
    description: "Medium-sized delivery for pallets and mixed loads.",
    capacity: "Up to 1.5 tons",
    icon: "van",
  },
  {
    id: "car",
    name: "Car",
    description: "Light, fast transport for urgent small shipments.",
    capacity: "Up to 200 kg",
    icon: "car",
  },
  {
    id: "moto",
    name: "Motorcycle",
    description: "Instant small parcel delivery across the city.",
    capacity: "Up to 20 kg",
    icon: "bike",
  },
];

export type Warehouse = {
  id: string;
  city: string;
  area: string;
  pricing: string;
  status: "Available" | "Filling Fast";
  image: string;
};

export const warehouses: Warehouse[] = [
  {
    id: "w1",
    city: "Casablanca",
    area: "12,000 sqm",
    pricing: "From $4.5 / sqm",
    status: "Available",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "w2",
    city: "Tangier",
    area: "8,500 sqm",
    pricing: "From $5.2 / sqm",
    status: "Filling Fast",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "w3",
    city: "Agadir",
    area: "6,200 sqm",
    pricing: "From $3.9 / sqm",
    status: "Available",
    image:
      "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=800&q=70",
  },
];

export type Step = {
  id: number;
  title: string;
  description: string;
  icon: "search" | "handshake" | "boxes" | "radar";
};

export const steps: Step[] = [
  {
    id: 1,
    title: "Search Product",
    description: "Find your product or service across the platform.",
    icon: "search",
  },
  {
    id: 2,
    title: "Find Supplier",
    description: "Choose the verified match that fits your needs.",
    icon: "handshake",
  },
  {
    id: 3,
    title: "Manage Logistics",
    description: "Book the transport or warehouse space you need.",
    icon: "boxes",
  },
  {
    id: 4,
    title: "Track Your Order",
    description: "Monitor everything seamlessly from your dashboard.",
    icon: "radar",
  },
];

export type Stat = { id: string; value: number; suffix: string; label: string };

export const stats: Stat[] = [
  { id: "suppliers", value: 500, suffix: "+", label: "Suppliers" },
  { id: "products", value: 1000, suffix: "+", label: "Products" },
  { id: "drivers", value: 300, suffix: "+", label: "Drivers" },
  { id: "warehouses", value: 100, suffix: "+", label: "Warehouses" },
];

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "MCG Global cut our sourcing time in half. We found a verified supplier and booked warehousing in the same afternoon.",
    name: "Yassine El Amrani",
    role: "Importer, Casablanca",
    initials: "YE",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "The logistics matching is brilliant. Transparent pricing and reliable drivers — no more guesswork on delivery.",
    name: "Sara Benali",
    role: "Retail Buyer, Marrakech",
    initials: "SB",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "As a supplier, the verification badge built instant trust. Our cross-border orders grew 3x in six months.",
    name: "Li Wei",
    role: "Supplier, Shenzhen",
    initials: "LW",
    rating: 5,
  },
];
