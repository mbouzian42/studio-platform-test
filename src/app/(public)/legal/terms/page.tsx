import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Studio Platform",
  description:
    "Conditions générales de vente applicables aux services d'Studio Platform.",
};

export default function TermsPage() {
  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[800px] md:px-6 md:pt-12">
      <h1 className="font-display text-[30px] font-bold leading-tight">
        Conditions Générales de Vente
      </h1>

      <div className="mt-8 space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 1 — Objet
          </h2>
          <p className="text-sm">
            Les présentes Conditions Générales de Vente (CGV) régissent les
            relations contractuelles entre Studio Platform et ses clients dans le
            cadre de la vente de services de studio d&apos;enregistrement,
            de beats musicaux et de services de mixage via le site{" "}
            {siteConfig.url}.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 2 — Services proposés
          </h2>
          <p className="text-sm">Studio Platform propose les services suivants :</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>
              Réservation de sessions d&apos;enregistrement dans l&apos;un des 3
              studios (Studio A, Studio B, Studio C)
            </li>
            <li>
              Vente de productions musicales (beats) avec licence simple ou
              exclusive
            </li>
            <li>
              Service de mixage professionnel avec suivi et retouches
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 3 — Tarifs et paiement
          </h2>
          <p className="text-sm">
            Les tarifs sont affichés en euros TTC sur le site. Le paiement
            s&apos;effectue en ligne par carte bancaire via un prestataire de
            paiement sécurisé (Stripe). Pour les réservations de studio, un
            acompte de 20% ou le paiement intégral est requis au moment de la
            réservation.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 4 — Réservations et annulations
          </h2>
          <p className="text-sm">
            Les créneaux réservés sont confirmés après paiement. Les conditions
            d&apos;annulation et de remboursement sont consultables avant la
            finalisation de la réservation. Un créneau annulé est remis à
            disposition pour les autres clients.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 5 — Licences de beats
          </h2>
          <p className="text-sm">
            L&apos;achat d&apos;un beat donne droit à une licence d&apos;utilisation
            selon les termes du contrat de licence choisi (simple ou exclusive).
            La licence simple est non exclusive et permet une utilisation
            commerciale encadrée. La licence exclusive transfère les droits
            d&apos;utilisation exclusifs et retire le beat de la vente.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 6 — Service de mixage
          </h2>
          <p className="text-sm">
            Le service de mixage comprend le traitement des pistes audio
            fournies par le client, un mix initial et jusqu&apos;à 2 retouches
            incluses. Les retouches supplémentaires peuvent être facturées. Le
            délai de livraison est indicatif et peut varier selon la charge de
            travail.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 7 — Droit de rétractation
          </h2>
          <p className="text-sm">
            Conformément à l&apos;article L221-28 du Code de la consommation, le
            droit de rétractation ne s&apos;applique pas aux contenus numériques
            fournis de manière dématérialisée (beats téléchargés) ni aux
            prestations de services pleinement exécutées avant la fin du délai
            de rétractation.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 8 — Données personnelles
          </h2>
          <p className="text-sm">
            Les données personnelles collectées sont traitées conformément à
            notre{" "}
            <a
              href="/legal/privacy"
              className="text-purple-400 hover:text-purple-300"
            >
              Politique de confidentialité
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
            Article 9 — Droit applicable
          </h2>
          <p className="text-sm">
            Les présentes CGV sont soumises au droit français. En cas de litige,
            les parties s&apos;engagent à rechercher une solution amiable avant
            de saisir les juridictions compétentes.
          </p>
        </section>
      </div>
    </div>
  );
}
