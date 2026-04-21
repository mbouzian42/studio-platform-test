"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { uploadBeatSchema } from "@/schemas/beat";
import { createBeatWithFiles } from "@/actions/beats";
import { BeatFileUploader } from "./beat-file-uploader";
import { Loader2 } from "lucide-react";
import { ZodError } from "zod";

export function AdminBeatUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [priceSimple, setPriceSimple] = useState("");
  const [priceExclusive, setPriceExclusive] = useState("");
  const [published, setPublished] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      toast({ title: "Erreur", description: "Le fichier audio est requis", variant: "error" });
      return;
    }

    if (!coverFile) {
      toast({ title: "Erreur", description: "L'image de couverture est requise", variant: "error" });
      return;
    }

    setLoading(true);

    try {
      const metadata = {
        title,
        bpm: bpm ? parseInt(bpm) : undefined,
        key: key || undefined,
        genre: genre || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        priceSimple: priceSimple ? parseFloat(priceSimple) : 0,
        priceExclusive: priceExclusive ? parseFloat(priceExclusive) : null,
        published,
      };

      // Validate metadata
      const validated = uploadBeatSchema.parse(metadata);

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("cover", coverFile);
      formData.append("metadata", JSON.stringify(validated));

      const result = await createBeatWithFiles(formData);

      if (result.success) {
        toast({ title: "Succès", description: "Le beat a été uploadé avec succès", variant: "success" });
        router.push("/admin/beats");
        router.refresh();
      } else {
        toast({ title: "Erreur", description: result.error, variant: "error" });
      }
    } catch (err: any) {
      let errorMessage = "Une erreur est survenue";
      
      if (err instanceof ZodError) {
        errorMessage = err.issues?.[0]?.message || err.errors?.[0]?.message || "Données invalides";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast({ title: "Erreur", description: errorMessage, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Titre *</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
              placeholder="Ex: Nuit Blanche"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">BPM</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Ex: 140"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tonalité (Key)</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Ex: Am"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Ex: Trap"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tags (séparés par des virgules)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Ex: dark, hard, drill"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Prix Simple (€)</label>
              <input
                type="number"
                step="0.01"
                value={priceSimple}
                onChange={(e) => setPriceSimple(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Ex: 29.99"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Prix Exclusif (€)</label>
              <input
                type="number"
                step="0.01"
                value={priceExclusive}
                onChange={(e) => setPriceExclusive(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Ex: 499.99"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border-subtle bg-bg-surface text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="published" className="text-sm font-medium">Publier immédiatement</label>
          </div>
        </div>

        {/* File Uploaders */}
        <div className="space-y-6">
          <BeatFileUploader
            label="Fichier Audio (.wav, .mp3, .aiff, .flac) *"
            accept=".wav,.mp3,.aiff,.flac"
            maxSizeMb={200}
            file={audioFile}
            onFileChange={setAudioFile}
          />

          <BeatFileUploader
            label="Image de couverture (JPG, PNG, WEBP) *"
            accept=".jpg,.jpeg,.png,.webp"
            maxSizeMb={10}
            file={coverFile}
            onFileChange={setCoverFile}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-brand-gradient px-8 py-3 font-display font-bold text-white shadow-lg transition-transform hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Upload en cours...
            </>
          ) : (
            "Uploader le beat"
          )}
        </button>
      </div>
    </form>
  );
}
