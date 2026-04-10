"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "Dans quel format envoyer mes fichiers ?",
    answer:
      "Pour le Mix Standard, envoie ta prod en WAV (44.1kHz / 24bit minimum) + tes voix séparées. Pour le Mix Premium, envoie toutes tes pistes séparées (stems) au même format. Évite le MP3 pour la prod.",
  },
  {
    question: "Combien de retouches sont incluses ?",
    answer:
      "Le Mix Standard inclut 2 retouches, le Mix Premium en inclut 3. Une retouche = un aller-retour avec des modifications précises. Les retouches supplémentaires sont facturées 15 € chacune.",
  },
  {
    question: "Quel est le délai de livraison ?",
    answer:
      "Comptez 2 à 5 jours ouvrés après réception de vos fichiers. Si vous avez un délai serré, contactez-nous pour voir si un traitement prioritaire est possible.",
  },
];

export function MixingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3 mb-8">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-border-subtle bg-bg-elevated overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="font-display text-sm font-semibold pr-4">
              {item.question}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-200",
                openIndex === i && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-200",
              openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <p className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
