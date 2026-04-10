"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, X, FileAudio, ImageIcon } from "lucide-react";

interface BeatFileUploaderProps {
  label: string;
  accept: string;
  maxSizeMb: number;
  file: File | null;
  onFileChange: (file: File | null) => void;
  previewUrl?: string;
}

export function BeatFileUploader({
  label,
  accept,
  maxSizeMb,
  file,
  onFileChange,
  previewUrl,
}: BeatFileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isImage = accept.includes("jpg") || accept.includes("png") || accept.includes("webp");

  const validateFile = useCallback(
    (f: File): string | null => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      const formats = accept.split(",").map((s) => s.trim());
      if (!formats.includes(ext)) {
        return `Format non supporté : ${ext}. Formats acceptés : ${accept}`;
      }
      if (f.size > maxSizeMb * 1024 * 1024) {
        return `Fichier trop volumineux : ${(f.size / 1024 / 1024).toFixed(0)} Mo. Maximum : ${maxSizeMb} Mo`;
      }
      return null;
    },
    [accept, maxSizeMb],
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setError(null);
      const f = fileList[0];
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
      onFileChange(f);
    },
    [onFileChange, validateFile],
  );

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (file && isImage) {
      objectUrlRef.current = URL.createObjectURL(file);
    }
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file, isImage]);

  const imagePreviewSrc = file && isImage ? objectUrlRef.current : previewUrl;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-3">
          {imagePreviewSrc ? (
            <img
              src={imagePreviewSrc}
              alt="Aperçu"
              className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
            />
          ) : (
            <FileAudio className="h-5 w-5 flex-shrink-0 text-purple-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-text-muted">
              {(file.size / 1024 / 1024).toFixed(1)} Mo
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="rounded p-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? "border-purple-500 bg-purple-500/10"
              : "border-border-subtle hover:border-border-default"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = accept;
            input.onchange = () => handleFiles(input.files);
            input.click();
          }}
        >
          {isImage ? (
            <ImageIcon className="mx-auto h-8 w-8 text-text-muted" />
          ) : (
            <Upload className="mx-auto h-8 w-8 text-text-muted" />
          )}
          <p className="mt-2 text-sm text-text-secondary">
            Dépose ton fichier ici ou clique pour sélectionner
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Formats : {accept.replace(/\./g, "").toUpperCase()} — Max {maxSizeMb} Mo
          </p>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
