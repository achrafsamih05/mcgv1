import { whatsappLink } from "@/lib/content";
import { WhatsAppIcon } from "@/components/ui/icons";

/** Persistent quick-contact action, bottom-right. */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink("Hello MCG Global!")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-emerald-900/30 transition-colors duration-200 hover:bg-whatsapp-dark"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
