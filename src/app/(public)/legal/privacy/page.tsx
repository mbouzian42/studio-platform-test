import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Studio Platform",
  description:
    "Politique de confidentialité et gestion des données personnelles d'Studio Platform.",
};

export default function PrivacyPage() {
  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[800px] md:px-6 md:pt-12">
      <h1 className="font-display text-[30px] font-bold leading-tight">
        Politique de confidentialité
      </h1>

      <div className="mt-8 space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            1. Responsable du traitement
          </h2>
          <p className="text-sm">
            Le responsable du traitement des données personnelles est 
            Studio, situé au {siteConfig.contact.address}. Pour toute question
            relative à la gestion de vos données, contactez-nous à{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-purple-400 hover:text-purple-300"
            >
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            2. Données collectées
          </h2>
          <p className="text-sm">
            Dans le cadre de l&apos;utilisation du site et de nos services, nous
            collectons les données suivantes :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>
              Données d&apos;identification : nom, prénom, adresse email,
              numéro de téléphone
            </li>
            <li>
              Données de connexion : adresse IP, identifiants de compte
            </li>
            <li>
              Données de transaction : historique des réservations, achats de
              beats, commandes de mixage
            </li>
            <li>
              Données de navigation : cookies, pages visitées (avec votre
              consentement)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            3. Finalités du traitement
          </h2>
          <p className="text-sm">Vos données sont collectées pour :</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>
              La gestion de votre compte utilisateur et l&apos;authentification
            </li>
            <li>
              Le traitement de vos réservations, achats et commandes de mixage
            </li>
            <li>
              L&apos;envoi de confirmations et communications transactionnelles
              par email
            </li>
            <li>
              L&apos;amélioration de nos services et de l&apos;expérience
              utilisateur
            </li>
            <li>Le respect de nos obligations légales et comptables</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            4. Base légale du traitement
          </h2>
          <p className="text-sm">
            Le traitement de vos données repose sur l&apos;exécution du contrat
            (réservations, achats), votre consentement (cookies, newsletter) et
            nos obligations légales (facturation, comptabilité).
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            5. Durée de conservation
          </h2>
          <p className="text-sm">
            Les données personnelles sont conservées pendant la durée de votre
            compte utilisateur et supprimées dans un délai de 30 jours après la
            demande de suppression de compte. Les données de facturation sont
            conservées 10 ans conformément aux obligations comptables.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            6. Partage des données
          </h2>
          <p className="text-sm">
            Vos données ne sont jamais vendues à des tiers. Elles peuvent être
            partagées avec nos sous-traitants techniques (hébergement, paiement)
            dans le strict cadre de l&apos;exécution de nos services :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Supabase (base de données et authentification)</li>
            <li>Stripe (traitement des paiements)</li>
            <li>Vercel (hébergement du site)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            7. Vos droits (RGPD)
          </h2>
          <p className="text-sm">
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Droit d&apos;accès à vos données personnelles</li>
            <li>Droit de rectification des données inexactes</li>
            <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d&apos;opposition au traitement</li>
            <li>Droit à la limitation du traitement</li>
          </ul>
          <p className="mt-2 text-sm">
            Pour exercer ces droits, contactez-nous à{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-purple-400 hover:text-purple-300"
            >
              {siteConfig.contact.email}
            </a>
            . La suppression de votre compte est également possible directement
            depuis votre espace personnel.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            8. Cookies
          </h2>
          <p className="text-sm">
            Le site utilise des cookies strictement nécessaires au
            fonctionnement du service (authentification, préférences). Aucun
            cookie publicitaire ou de tracking n&apos;est utilisé sans votre
            consentement explicite.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            9. Contact
          </h2>
          <p className="text-sm">
            Pour toute question relative à cette politique de confidentialité,
            vous pouvez nous contacter à{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-purple-400 hover:text-purple-300"
            >
              {siteConfig.contact.email}
            </a>{" "}
            ou via notre{" "}
            <Link
              href="/#contact"
              className="text-purple-400 hover:text-purple-300"
            >
              formulaire de contact
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
