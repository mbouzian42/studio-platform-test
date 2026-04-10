"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileAudio } from "lucide-react";

interface StemUploaderProps {
  multiple: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  acceptedFormats?: string;
  maxSizeMb?: number;
}

const DEFAULT_FORMATS = ".wav,.aiff,.flac";
const DEFAULT_MAX_SIZE_MB = 200;

export function StemUploader({
  multiple,
  files,
  onFilesChange,
  acceptedFormats = DEFAULT_FORMATS,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
}: StemUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const formats = acceptedFormats.split(",").map((f) => f.trim());
      if (!formats.includes(ext)) {
        return `Format non supporté : ${ext}. Formats acceptés : ${acceptedFormats}`;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        return `Fichier trop volumineux : ${(file.size / 1024 / 1024).toFixed(0)} Mo. Maximum : ${maxSizeMb} Mo`;
      }
      return null;
    },
    [acceptedFormats, maxSizeMb],
  );

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      setError(null);

      const fileArray = Array.from(newFiles);
      for (const file of fileArray) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
      }

      if (multiple) {
        onFilesChange([...files, ...fileArray]);
      } else {
        onFilesChange(fileArray.slice(0, 1));
      }
    },
    [files, multiple, onFilesChange, validateFile],
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {multiple ? "Tes fichiers audio (stems)" : "Tes fichiers audio"}
      </p>
      {!multiple && (
        <p className="text-sm text-text-secondary">
          Envoie le fichier de ta voix et le fichier de l&apos;instru (2 fichiers).
        </p>
      )}

      {/* Drop zone */}
      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
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
          input.accept = acceptedFormats;
          input.multiple = multiple;
          input.onchange = () => handleFiles(input.files);
          input.click();
        }}
      >
        <Upload className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-2 text-sm text-text-secondary">
          Dépose tes fichiers ici ou clique pour sélectionner
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Formats : {acceptedFormats.replace(/\./g, "").toUpperCase()} — Max{" "}
          {maxSizeMb} Mo par fichier
        </p>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-error">{error}</p>}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-3"
            >
              <FileAudio className="h-5 w-5 flex-shrink-0 text-purple-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-text-muted">
                  {(file.size / 1024 / 1024).toFixed(1)} Mo
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="rounded p-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
