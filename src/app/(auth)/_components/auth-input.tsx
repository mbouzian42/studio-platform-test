interface AuthInputProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  optional?: boolean;
  minLength?: number;
  autoComplete?: string;
}

export function AuthInput({
  label,
  name,
  type,
  placeholder,
  required,
  optional,
  minLength,
  autoComplete,
}: AuthInputProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1 text-text-muted">(optionnel)</span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-lg border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
    </div>
  );
}
