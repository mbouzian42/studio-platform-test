import { BeatUploadForm } from "@/components/beats/beat-upload-form";

export default function BeatUploadPage() {
  return (
    <BeatUploadForm
      backHref="/engineer/beats"
      backLabel="Mes beats"
      redirectTo="/engineer/beats"
    />
  );
}
