"use client";

interface BriefFormProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function BriefForm({
  value,
  onChange,
  maxLength = 2000,
}: BriefFormProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Brief de mixage
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={5}
        placeholder="Décris l'ambiance souhaitée, les éléments importants, les références musicales...

Ex: « Mix aérien, beaucoup de reverb sur le refrain, pas trop de compression sur les couplets. Référence : PNL — Au DD »"
        className="w-full resize-none rounded-lg border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
      <p className="text-right text-xs text-text-muted">
        {value.length} / {maxLength}
      </p>
    </div>
  );
}
