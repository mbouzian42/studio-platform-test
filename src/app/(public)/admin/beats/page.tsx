"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Trash2, Music, Plus, ChevronUp, Upload, Loader2 } from "lucide-react";
import { checkAdminAccess } from "@/actions/admin";
import {
  getAdminBeats,
  adminUpdateBeat,
  adminDeleteBeat,
  type AdminBeat,
} from "@/actions/admin-beats";
import { createBeatWithFiles, toggleBeatPublish } from "@/actions/beats";
import { uploadBeatSchema } from "@/schemas/beat";
import { BeatFileUploader } from "@/components/beats/beat-file-uploader";
import { toast } from "@/components/ui/toaster";

function getStatusLabel(beat: AdminBeat): { label: string; color: string } {
  if (beat.is_exclusive_sold) return { label: "Vendu (exclusif)", color: "text-error" };
  if (beat.is_published) return { label: "Publié", color: "text-success" };
  return { label: "Brouillon", color: "text-warning" };
}

export default function AdminBeatsCatalogPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<AdminBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editPriceExcl, setEditPriceExcl] = useState(0);

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState(120);
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [priceSimple, setPriceSimple] = useState(29);
  const [priceExclusive, setPriceExclusive] = useState(0);
  const [publishImmediately, setPublishImmediately] = useState(false);

  useEffect(() => {
    async function load() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      const result = await getAdminBeats();
      if (result.success) setBeats(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  const resetUploadForm = useCallback(() => {
    setAudioFile(null);
    setCoverFile(null);
    setTitle("");
    setBpm(120);
    setKey("");
    setGenre("");
    setTagsInput("");
    setPriceSimple(29);
    setPriceExclusive(0);
    setPublishImmediately(false);
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!audioFile || !coverFile) {
      toast({ title: "Erreur", description: "Fichiers audio et image requis", variant: "error" });
      return;
    }

    // Parse tags from comma-separated input
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Client-side validation with Zod
    const validation = uploadBeatSchema.safeParse({
      title,
      bpm,
      key: key || "N/A",
      genre: genre || "Beat",
      tags,
      priceSimple,
      priceExclusive: priceExclusive > 0 ? priceExclusive : null,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast({ title: "Validation", description: firstError.message, variant: "error" });
      return;
    }

    setUploading(true);

    try {
      // Build FormData for the server action
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("cover", coverFile);
      formData.append(
        "metadata",
        JSON.stringify({
          title: validation.data.title,
          bpm: validation.data.bpm,
          key: validation.data.key,
          genre: validation.data.genre,
          tags: validation.data.tags ?? [],
          priceSimple: validation.data.priceSimple,
          priceExclusive: validation.data.priceExclusive,
        }),
      );

      const result = await createBeatWithFiles(formData);

      if (!result.success) {
        toast({ title: "Erreur d'upload", description: result.error, variant: "error" });
        setUploading(false);
        return;
      }

      // If publish immediately, toggle publish
      if (publishImmediately) {
        await toggleBeatPublish(result.data.id, true);
      }

      // Prepend new beat to list
      const newAdminBeat: AdminBeat = {
        ...result.data,
        is_published: publishImmediately,
        sales_count: 0,
      };
      setBeats((prev) => [newAdminBeat, ...prev]);

      toast({
        title: "Beat uploadé !",
        description: publishImmediately
          ? `"${result.data.title}" est maintenant en ligne`
          : `"${result.data.title}" sauvegardé en brouillon`,
        variant: "success",
      });

      resetUploadForm();
      setShowUploadForm(false);
    } catch {
      toast({ title: "Erreur", description: "Une erreur inattendue est survenue", variant: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleTogglePublish(beat: AdminBeat) {
    const result = await adminUpdateBeat(beat.id, {
      is_published: !beat.is_published,
    });
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) =>
      prev.map((b) =>
        b.id === beat.id ? { ...b, is_published: !b.is_published } : b,
      ),
    );
    toast({
      title: beat.is_published ? "Beat dépublié" : "Beat publié",
      variant: "success",
    });
  }

  async function handleDelete(beatId: string) {
    const result = await adminDeleteBeat(beatId);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) =>
      prev.map((b) =>
        b.id === beatId ? { ...b, is_published: false } : b,
      ),
    );
    toast({ title: "Beat retiré de la marketplace", variant: "success" });
  }

  async function handleSavePrice(beatId: string) {
    const result = await adminUpdateBeat(beatId, {
      price_simple: editPrice,
      price_exclusive: editPriceExcl > 0 ? editPriceExcl : null,
    });
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) =>
      prev.map((b) =>
        b.id === beatId
          ? {
              ...b,
              price_simple: editPrice,
              price_exclusive: editPriceExcl > 0 ? editPriceExcl : null,
            }
          : b,
      ),
    );
    setEditingId(null);
    toast({ title: "Prix mis à jour", variant: "success" });
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight">
        Catalogue Beats
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {beats.length} beat{beats.length > 1 ? "s" : ""} au total
      </p>

      {/* ── Upload section ── */}
      <div className="mt-6">
        {showUploadForm ? (
          <button
            type="button"
            onClick={() => setShowUploadForm(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-hover"
          >
            <ChevronUp className="h-4 w-4" />
            <span>Fermer</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un beat</span>
          </button>
        )}

        {showUploadForm && (
          <form
            onSubmit={handleUpload}
            className="mt-4 space-y-5 rounded-lg border border-border-subtle bg-bg-surface p-5"
          >
            <h2 className="font-display text-lg font-semibold">Nouveau beat</h2>

            {/* File uploaders */}
            <div className="grid gap-4 md:grid-cols-2">
              <BeatFileUploader
                label="Fichier audio"
                accept=".wav,.mp3,.m4a,.aiff,.flac"
                maxSizeMb={200}
                file={audioFile}
                onFileChange={setAudioFile}
              />
              <BeatFileUploader
                label="Image de couverture"
                accept=".jpg,.jpeg,.png,.webp"
                maxSizeMb={10}
                file={coverFile}
                onFileChange={setCoverFile}
              />
            </div>

            {/* Metadata fields */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="beat-title" className="mb-1.5 block text-sm font-medium">
                  Titre *
                </label>
                <input
                  id="beat-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nuit Blanche"
                  required
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* BPM */}
              <div>
                <label htmlFor="beat-bpm" className="mb-1.5 block text-sm font-medium">
                  BPM
                </label>
                <input
                  id="beat-bpm"
                  type="number"
                  min={40}
                  max={300}
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Key */}
              <div>
                <label htmlFor="beat-key" className="mb-1.5 block text-sm font-medium">
                  Tonalité
                </label>
                <input
                  id="beat-key"
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Ex: Am, Cm, F#m"
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Genre */}
              <div>
                <label htmlFor="beat-genre" className="mb-1.5 block text-sm font-medium">
                  Genre
                </label>
                <input
                  id="beat-genre"
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Ex: Trap, Drill, R&B"
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="beat-tags" className="mb-1.5 block text-sm font-medium">
                  Tags
                </label>
                <input
                  id="beat-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="dark, hard, 808 (séparés par des virgules)"
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="beat-price-simple" className="mb-1.5 block text-sm font-medium">
                  Prix licence simple (€) *
                </label>
                <input
                  id="beat-price-simple"
                  type="number"
                  min={1}
                  value={priceSimple}
                  onChange={(e) => setPriceSimple(parseInt(e.target.value) || 0)}
                  required
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="beat-price-exclusive" className="mb-1.5 block text-sm font-medium">
                  Prix licence exclusive (€)
                </label>
                <input
                  id="beat-price-exclusive"
                  type="number"
                  min={0}
                  value={priceExclusive}
                  onChange={(e) => setPriceExclusive(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Laisser à 0 pour désactiver la licence exclusive
                </p>
              </div>
            </div>

            {/* Publish immediately toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-border-subtle bg-bg-elevated text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm font-medium">Publier immédiatement</span>
              <span className="text-xs text-text-muted">(sinon sauvegardé en brouillon)</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading || !audioFile || !coverFile || !title.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Uploader le beat
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* ── Existing beat list ── */}
      <div className="mt-8 space-y-3">
        {beats.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Music className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">Aucun beat</p>
            <p className="mt-1 text-sm text-text-muted">
              Clique sur &quot;Ajouter un beat&quot; pour commencer
            </p>
          </div>
        ) : (
          beats.map((beat) => {
            const status = getStatusLabel(beat);
            const isEditing = editingId === beat.id;

            return (
              <div
                key={beat.id}
                className="rounded-lg border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      {beat.cover_image_url ? (
                        <img
                          src={beat.cover_image_url}
                          alt={beat.title}
                          className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-purple-600/40 to-pink-500/40">
                          <Music className="h-4 w-4 text-white/60" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-display font-semibold">
                          {beat.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          {beat.bpm && <span>{beat.bpm} BPM</span>}
                          {beat.key && <span>{beat.key}</span>}
                          {beat.genre && <span>{beat.genre}</span>}
                          <span>·</span>
                          <span>{beat.sales_count} vente{beat.sales_count > 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                    <p className={`mt-1 ml-13 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </p>
                  </div>

                  {/* Pricing */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={editPrice}
                        onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-border-subtle bg-bg-primary px-2 py-1 text-right text-xs font-bold"
                        placeholder="Simple"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editPriceExcl}
                        onChange={(e) => setEditPriceExcl(parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-border-subtle bg-bg-primary px-2 py-1 text-right text-xs font-bold"
                        placeholder="Exclu"
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePrice(beat.id)}
                        className="rounded bg-brand-gradient px-2 py-1 text-xs font-semibold text-white"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-text-muted"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(beat.id);
                        setEditPrice(beat.price_simple);
                        setEditPriceExcl(beat.price_exclusive ?? 0);
                      }}
                      className="text-right text-xs text-text-muted hover:text-text-primary"
                    >
                      <span className="font-display font-bold text-text-primary">
                        {beat.price_simple}€
                      </span>
                      {beat.price_exclusive && (
                        <span className="ml-1">/ {beat.price_exclusive}€</span>
                      )}
                      <br />
                      <span className="text-[10px]">Modifier</span>
                    </button>
                  )}
                </div>

                {/* Actions */}
                {!beat.is_exclusive_sold && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(beat)}
                      className="flex items-center gap-1 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-hover"
                    >
                      {beat.is_published ? (
                        <>
                          <EyeOff className="h-3 w-3" /> Dépublier
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Publier
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(beat.id)}
                      className="flex items-center gap-1 rounded-lg border border-error/30 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10"
                    >
                      <Trash2 className="h-3 w-3" /> Retirer
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
