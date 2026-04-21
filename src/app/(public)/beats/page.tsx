import { getPublishedBeats } from "@/actions/beats";
import { BeatsMarketplaceClient } from "./BeatsMarketplaceClient";

export const metadata = {
  title: "Catalogue de Beats | Studio Beats",
  description: "Découvrez nos dernières productions et trouvez le beat parfait pour votre prochain projet musical.",
};

export default async function BeatsPage() {
  const result = await getPublishedBeats();
  const beats = result.success ? result.data : [];

  return <BeatsMarketplaceClient initialBeats={beats} />;
}
