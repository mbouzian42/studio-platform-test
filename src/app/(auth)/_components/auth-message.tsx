import { cn } from "@/lib/utils";

interface AuthMessageProps {
  type: "error" | "success";
  message: string;
}

export function AuthMessage({ type, message }: AuthMessageProps) {
  return (
    <div
      className={cn(
        "mb-4 rounded-lg border p-3 text-sm",
        type === "error"
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success"
      )}
      role="alert"
    >
      {message}
    </div>
  );
}
