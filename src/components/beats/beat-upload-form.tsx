"use client";

import { useState, useRef } from "react";
import { Upload, X, Music, Image as ImageIcon, Loader2 } from "lucide-react";
import { createBeat, finalizeBeatUpload, deleteDraftBeat } from "@/actions/beats";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";

interface BeatUploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function getExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return "." + parts.pop()!.toLowerCase();
}

export function BeatUploadForm({ onSuccess, onCancel }: BeatUploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState<number>(120);
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [priceSimple, setPriceSimple] = useState<number>(29.99);
  const [priceExclusive, setPriceExclusive] = useState<number>(149.99);
  const [isPublished, setIsPublished] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !coverFile || !title) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs requis", variant: "error" });
      return;
    }

    setLoading(true);
    let createdBeatId: string | null = null;
    let userId: string | null = null;
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée. Veuillez vous reconnecter.");
      userId = user.id;

      // 1. Initialiser le record du beat en base (Draft)
      const initResult = await createBeat({
        title,
        bpm,
        key,
        genre,
        tags: tags.split(",").map(t => t.trim()).filter(t => t),
        priceSimple,
        priceExclusive,
        isPublished: false // Toujours non-publié tant que les fichiers ne sont pas là
      });

      if (!initResult.success) {
        throw new Error(initResult.error || "Erreur création beat");
      }
      if (!initResult.data) {
        throw new Error("Erreur: données du beat manquantes");
      }
      
      createdBeatId = initResult.data.id;
      const basePath = `${userId}/${createdBeatId}`;

      // 2. Upload des fichiers
      const coverExt = getExtension(coverFile.name);
      const coverPath = `${basePath}/cover${coverExt}`;
      const { error: coverErr } = await supabase.storage
        .from("beat-previews")
        .upload(coverPath, coverFile, { upsert: true, contentType: coverFile.type });
      if (coverErr) throw new Error("Erreur upload cover: " + coverErr.message);

      const audioExt = getExtension(audioFile.name);
      const audioPath = `${basePath}/audio${audioExt}`;
      const { error: audioErr } = await supabase.storage
        .from("beat-files")
        .upload(audioPath, audioFile, { upsert: true, contentType: audioFile.type });
      if (audioErr) throw new Error("Erreur upload audio: " + audioErr.message);

      const previewToUpload = previewFile || audioFile;
      const previewExt = getExtension(previewToUpload.name);
      const previewPath = `${basePath}/preview${previewExt}`;
      const { error: previewErr } = await supabase.storage
        .from("beat-previews")
        .upload(previewPath, previewToUpload, { upsert: true, contentType: previewToUpload.type });
      if (previewErr) throw new Error("Erreur upload preview: " + previewErr.message);

      // 3. Obtenir les URLs publiques
      const { data: coverUrl } = supabase.storage.from("beat-previews").getPublicUrl(coverPath);
      const { data: previewUrl } = supabase.storage.from("beat-previews").getPublicUrl(previewPath);

      // 4. Finaliser le process via le serveur (rattachement URLs + publication optionnelle)
      const finalResult = await finalizeBeatUpload(
        createdBeatId,
        {
          cover_image_url: coverUrl.publicUrl,
          audio_preview_url: previewUrl.publicUrl,
          audio_full_url: audioPath
        },
        isPublished
      );

      if (!finalResult.success) {
        throw new Error(finalResult.error || "Erreur lors de la finalisation");
      }

      toast({ title: "Succès", description: "Le beat a été uploadé avec succès", variant: "success" });
      onSuccess();
    } catch (error: any) {
      // Nettoyage en cas d'erreur de communication
      if (createdBeatId && userId) {
        await deleteDraftBeat(createdBeatId).catch(console.error);
        const basePath = `${userId}/${createdBeatId}`;
        supabase.storage.from("beat-previews").remove([`${basePath}/cover${getExtension(coverFile.name)}`, `${basePath}/preview${getExtension((previewFile || audioFile).name)}`]).catch(()=>{});
        supabase.storage.from("beat-files").remove([`${basePath}/audio${getExtension(audioFile.name)}`]).catch(()=>{});
      }
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue lors de l'upload", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Nouveau Beat</h2>
        <button type="button" onClick={onCancel} className="text-text-muted hover:text-text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Files */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Fichier Audio Complet (Vente)</label>
            <div 
              onClick={() => audioInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${audioFile ? "border-success bg-success/5" : "border-border-subtle hover:border-brand-primary"}`}
            >
              <Music className={`mb-2 h-6 w-6 ${audioFile ? "text-success" : "text-text-muted"}`} />
              <span className="text-center text-[10px] text-text-secondary">
                {audioFile ? audioFile.name : "Fichier audio complet (max 200MB)"}
              </span>
              <input 
                ref={audioInputRef}
                type="file" 
                accept="audio/*" 
                className="hidden" 
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Preview Audio (Optionnel - 30s)</label>
            <div 
              onClick={() => previewInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${previewFile ? "border-success bg-success/5" : "border-border-subtle hover:border-brand-primary"}`}
            >
              <Music className={`mb-2 h-6 w-6 ${previewFile ? "text-success" : "text-text-muted"}`} />
              <span className="text-center text-[10px] text-text-secondary">
                {previewFile ? previewFile.name : "Preview 30s (si vide, utilise le fichier complet)"}
              </span>
              <input 
                ref={previewInputRef}
                type="file" 
                accept="audio/*" 
                className="hidden" 
                onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Image de couverture (JPG, PNG, WEBP)</label>
            <div 
              onClick={() => coverInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${coverFile ? "border-success bg-success/5" : "border-border-subtle hover:border-brand-primary"}`}
            >
              <ImageIcon className={`mb-2 h-8 w-8 ${coverFile ? "text-success" : "text-text-muted"}`} />
              <span className="text-center text-xs text-text-secondary">
                {coverFile ? coverFile.name : "Cliquez ou glissez l'image (max 10MB)"}
              </span>
              <input 
                ref={coverInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">Titre *</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
              placeholder="Ex: Moonlight Drive"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">BPM</label>
              <input 
                type="number" 
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">Key</label>
              <input 
                type="text" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
                placeholder="Ex: C Minor"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">Genre</label>
              <input 
                type="text" 
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
                placeholder="Ex: Trap"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">Tags (séparés par ,)</label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
                placeholder="dark, hard, aggressive"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">Prix Simple (€)</label>
              <input 
                type="number" 
                step="0.01"
                value={priceSimple}
                onChange={(e) => setPriceSimple(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">Prix Exclusif (€)</label>
              <input 
                type="number" 
                step="0.01"
                value={priceExclusive}
                onChange={(e) => setPriceExclusive(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border-default bg-bg-primary px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border-default bg-bg-primary text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="isPublished" className="text-sm font-medium">Publier immédiatement</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="rounded-lg border border-border-default px-6 py-2 text-sm font-medium hover:bg-bg-hover"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-8 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-all hover:opacity-90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && <Upload className="h-4 w-4" />}
          <span>{loading ? "Upload en cours..." : "Uploader le Beat"}</span>
        </button>
      </div>
    </form>
  );
}
