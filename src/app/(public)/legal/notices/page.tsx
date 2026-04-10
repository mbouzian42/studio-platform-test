import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales — Studio Platform",
  description: "Mentions légales du site Studio Platform.",
};

export default function LegalNoticesPage() {
  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[800px] md:px-6 md:pt-12">
      <h1 className="font-display text-[30px] font-bold leading-tight">
        Mentions légales
      </h1>

      <div className="mt-8 space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Éditeur du site
          </h2>
          <p>
            Le site {siteConfig.url} est édité par Studio Platform.
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Raison sociale : Studio Platform</li>
            <li>Adresse : {siteConfig.contact.address}</li>
            <li>Email : {siteConfig.contact.email}</li>
            <li>Téléphone : {siteConfig.contact.phone}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Hébergement
          </h2>
          <p className="text-sm">
            Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
            Covina, CA 91723, États-Unis.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Propriété intellectuelle
          </h2>
          <p className="text-sm">
            L&apos;ensemble du contenu de ce site (textes, images, logos,
            vidéos, sons, mise en page) est la propriété exclusive
            d&apos;Studio Platform ou de ses partenaires. Toute reproduction,
            représentation ou diffusion, en tout ou partie, du contenu de ce
            site sur quelque support ou par tout procédé que ce soit est
            interdite sans l&apos;autorisation préalable écrite d&apos;
            Studio.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Responsabilité
          </h2>
          <p className="text-sm">
            Studio Platform s&apos;efforce de fournir des informations exactes
            et à jour sur ce site. Toutefois, Studio Platform ne peut garantir
            l&apos;exactitude, la complétude ou l&apos;actualité des
            informations diffusées. L&apos;utilisation du site et de son contenu
            se fait sous la seule responsabilité de l&apos;utilisateur.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Données personnelles
          </h2>
          <p className="text-sm">
            Les informations relatives au traitement des données personnelles
            sont détaillées dans notre{" "}
            <a
              href="/legal/privacy"
              className="text-purple-400 hover:text-purple-300"
            >
              Politique de confidentialité
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
