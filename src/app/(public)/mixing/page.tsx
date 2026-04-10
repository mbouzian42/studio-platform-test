import Link from "next/link";
import type { Metadata } from "next";
import { SlidersHorizontal, Check } from "lucide-react";
import { MixingFAQ } from "@/components/mixing/mixing-faq";
import { MIXING_STANDARD_PRICE, MIXING_PREMIUM_PRICE } from "@/config/site";

export const metadata: Metadata = {
  title: "Mixage — Studio Platform",
  description:
    "Confiez vos pistes à nos ingénieurs du son pour un mix professionnel. Mix Standard ou Premium, jusqu'à 2 retouches incluses.",
};

export default function MixingPage() {
  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[700px] md:px-6 md:pt-12">
      {/* Title */}
      <h1 className="font-display text-[30px] font-bold leading-tight mb-4">
        Mixage
      </h1>

      {/* Step Indicator */}
      <div className="mb-6 flex items-center gap-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
          1
        </div>
        <div className="h-[2px] flex-1 bg-border-subtle" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-default text-sm font-medium text-text-muted">
          2
        </div>
        <div className="h-[2px] flex-1 bg-border-subtle" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-default text-sm font-medium text-text-muted">
          3
        </div>
      </div>

      {/* Hero Card */}
      <div className="mb-8 rounded-xl p-6 text-center"
        style={{
          border: "2px solid transparent",
          backgroundImage: "linear-gradient(#141414, #141414), linear-gradient(135deg, #8B5CF6, #D946EF, #F43F5E)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}>
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-gradient">
          <SlidersHorizontal className="h-7 w-7 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          Mix professionnel
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Tu veux sortir un son ? Envoie-nous tes fichiers, dis-nous ce que tu veux, on s&apos;occupe du mix.
        </p>
      </div>

      {/* Formula Selection */}
      <h3 className="font-display text-xl font-semibold mb-4">
        Choisissez votre formule
      </h3>

      <div className="flex flex-col gap-4 mb-8">
        {/* Mix Standard */}
        <Link
          href="/mixing/order?formula=standard"
          className="block rounded-xl p-6 transition-all"
          style={{
            border: "2px solid transparent",
            backgroundImage: "linear-gradient(#141414, #141414), linear-gradient(135deg, #8B5CF6, #D946EF, #F43F5E)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-display text-lg font-bold">Mix Standard</h4>
            <span className="font-display text-2xl font-bold">{MIXING_STANDARD_PRICE}&nbsp;&euro;</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Envoyez votre prod (WAV) + vos voix. On s&apos;occupe du mix.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              2 retouches incluses
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              Session visio incluse si besoin
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              Livraison 2-5 jours
            </div>
          </div>
        </Link>

        {/* Mix Premium */}
        <Link
          href="/mixing/order?formula=premium"
          className="relative block rounded-xl p-6 transition-all"
          style={{
            border: "2px solid transparent",
            backgroundImage: "linear-gradient(#141414, #141414), linear-gradient(135deg, #8B5CF6, #D946EF, #F43F5E)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <span className="absolute -top-3 right-4 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">
            Recommandé
          </span>
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-display text-lg font-bold">Mix Premium</h4>
            <span className="font-display text-2xl font-bold">{MIXING_PREMIUM_PRICE}&nbsp;&euro;</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Envoyez vos pistes séparées (stems). Mix sur mesure, piste par piste.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              2 retouches incluses
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              Livraison 2-5 jours
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              Session visio incluse
            </div>
          </div>
        </Link>
      </div>

      {/* Comment ça marche */}
      <h3 className="font-display text-xl font-semibold mb-6">
        Comment ça marche
      </h3>
      <div className="flex flex-col gap-5 mb-8">
        {[
          { step: 1, title: "Envoie tes fichiers", desc: "Upload ta prod (WAV) et tes voix via le formulaire de commande." },
          { step: 2, title: "Briefing", desc: "Dis-nous ce que tu veux : références, ambiance, effets spécifiques." },
          { step: 3, title: "Mix en cours", desc: "Notre ingénieur du son travaille ton mix sous 2 à 5 jours." },
          { step: 4, title: "Retouches & livraison", desc: "Tu reçois ton mix, demande des retouches si besoin, et c'est prêt." },
        ].map((item) => (
          <div key={item.step} className="flex gap-4 items-start">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #D946EF, #F43F5E)" }}
            >
              {item.step}
            </div>
            <div>
              <h4 className="font-display text-base font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mb-8 text-center">
        <Link
          href="/mixing/order"
          className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-display text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #D946EF, #F43F5E)",
            boxShadow: "0 4px 24px rgba(139, 92, 246, 0.4)",
          }}
        >
          Commander un mixage
        </Link>
      </div>

      {/* Questions fréquentes */}
      <h3 className="font-display text-xl font-semibold mb-4">
        Questions fréquentes
      </h3>
      <MixingFAQ />
    </div>
  );
}
