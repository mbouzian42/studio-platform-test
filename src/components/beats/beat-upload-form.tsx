"use client";

import { useState, useRef } from "react";
import { Upload, Music, ImageIcon, X, Loader2 } from "lucide-react";
import { createBeatWithFiles } from "@/actions/beats";
import { adminUpdateBeat } from "@/actions/admin-beats";
import { toast } from "@/components/ui/toaster";

interface BeatUploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const GENRES = ["Trap", "Drill", "R&B", "Boom Bap", "Afro", "Cloud", "Dancehall", "Autre"];
const KEYS = ["Am", "Cm", "Dm", "Em", "Fm", "Gm", "Bm", "C", "D", "E", "F", "G", "A", "B"];

export function BeatUploadForm({ onSuccess, onCancel }: BeatUploadFormProps) {
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState(140);
  const [key, setKey] = useState("Am");
  const [genre, setGenre] = useState("Trap");
  const [tagsInput, setTagsInput] = useState("");
  const [priceSimple, setPriceSimple] = useState(29);
  const [priceExclusive, setPriceExclusive] = useState<number | "">(299);
  const [isPublished, setIsPublished] = useState(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

async function handleSubmit() {
  if (!audioFile) {
    toast({ title: "Fichier audio requis", variant: "error" });
    return;
  }
  if (!coverFile) {
    toast({ title: "Image de couverture requise", variant: "error" });
    return;
  }
  if (!title.trim()) {
    toast({ title: "Le titre est requis", variant: "error" });
    return;
  }

  setLoading(true);

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const metadata = {
    title: title.trim(),
    bpm,
    key,
    genre,
    tags,
    priceSimple,
    priceExclusive: priceExclusive === "" ? null : Number(priceExclusive),
    isPublished,
  };

  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("cover", coverFile);
  formData.append("metadata", JSON.stringify(metadata));

  try {
     const result = await createBeatWithFiles(formData);
    if (!result.success) {
      toast({ title: "Erreur upload", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Beat uploadé avec succès !", variant: "success" });
    setTimeout(() => onSuccess(), 100);
  } catch (err) {
    toast({
      title: "Erreur inattendue",
      description: err instanceof Error ? err.message : "Erreur serveur",
      variant: "error",
    });
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Nouveau beat</h2>
        <button type="button" onClick={onCancel} className="text-text-muted hover:text-text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Files */}
      <div className="grid grid-cols-2 gap-3">
        {/* Audio */}
        <button
          type="button"
          onClick={() => audioInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-default bg-bg-primary p-4 text-center transition-colors hover:bg-bg-hover"
        >
          <Music className="h-6 w-6 text-text-muted" />
          <span className="text-xs text-text-secondary">
            {audioFile ? audioFile.name : "WAV / MP3 / FLAC / AIFF"}
          </span>
          {audioFile && (
            <span className="text-[10px] text-text-muted">
              {(audioFile.size / 1024 / 1024).toFixed(1)} MB
            </span>
          )}
        </button>
        <input
          ref={audioInputRef}
          type="file"
          accept=".wav,.mp3,.aiff,.flac,audio/wav,audio/mpeg,audio/aiff,audio/flac"
          className="hidden"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
        />

        {/* Cover */}
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="relative flex flex-col items-center gap-2 overflow-hidden rounded-lg border border-dashed border-border-default bg-bg-primary p-4 text-center transition-colors hover:bg-bg-hover"
        >
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="cover"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-text-muted" />
          )}
          <span className="relative text-xs text-text-secondary">
            {coverFile ? coverFile.name : "JPG / PNG / WEBP"}
          </span>
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nuit Blanche"
          className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
      </div>

      {/* BPM + Key */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">BPM</label>
          <input
            type="number"
            min={60}
            max={220}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 140)}
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Tonalité</label>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          >
            {KEYS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Genre */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Genre</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm outline-none focus:border-brand-primary"
        >
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">
          Tags <span className="text-text-muted">(séparés par des virgules)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="dark, hard, melodic"
          className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Prix simple (€)
          </label>
          <input
            type="number"
            min={1}
            value={priceSimple}
            onChange={(e) => setPriceSimple(parseInt(e.target.value) || 1)}
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Prix exclusif (€) <span className="text-text-muted">optionnel</span>
          </label>
          <input
            type="number"
            min={0}
            value={priceExclusive}
            onChange={(e) =>
              setPriceExclusive(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Publish toggle */}
       <div
        className="flex cursor-pointer items-center gap-3"
        onClick={() => setIsPublished((v) => !v)}
      >
        <div
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
            isPublished ? "bg-green-500" : "bg-bg-hover"
          }`}
        >
          <div
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              isPublished ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </div>
        <span className="text-sm font-medium select-none">
          {isPublished ? "Publier immédiatement" : "Enregistrer en brouillon"}
        </span>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Upload en cours…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Uploader le beat
          </>
        )}
      </button>
    </div>
  );
}