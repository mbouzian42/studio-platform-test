import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminBeatUploadForm } from "@/components/beats/admin-beat-upload-form";

export const metadata = {
  title: "Uploader un Beat | Admin",
  description: "Ajouter une nouvelle production au catalogue du studio.",
};

export default function AdminBeatUploadPage() {
  return (
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/admin/beats"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Catalogue
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight mb-2">
        Nouveau Beat
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        Remplissez les informations et uploadez les fichiers pour ajouter un beat à la marketplace.
      </p>

      <div className="max-w-4xl">
        <AdminBeatUploadForm />
      </div>
    </div>
  );
}
