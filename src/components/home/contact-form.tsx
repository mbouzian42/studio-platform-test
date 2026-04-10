"use client";

import { useState } from "react";
import { submitContactForm } from "@/actions/contact";
import { contactFormSchema } from "@/schemas/contact";
import { toast } from "@/components/ui/toaster";

export function HomeContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Client-side Zod validation
    const parsed = contactFormSchema.safeParse({ name, email, phone, subject, message });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setPending(true);
    const result = await submitContactForm({ name, email, phone, subject, message });

    if (!result.success) {
      setErrors({ form: result.error });
      setPending(false);
      return;
    }

    toast({
      title: "Message envoyé !",
      description: "On te répond dans les plus brefs délais.",
      variant: "success",
    });
    setSubmitted(true);
    setPending(false);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="font-display text-xl font-bold">Merci !</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Ton message a bien été envoyé. On te répond rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
            Nom
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton nom"
            className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@email.com"
            className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium">
          Téléphone
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
          className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium">
          Sujet
        </label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="">Choisis un sujet</option>
          <option value="Réservation de session">Réservation de session</option>
          <option value="Marketplace de beats">Marketplace de beats</option>
          <option value="Service de mixage">Service de mixage</option>
          <option value="Collaboration artistique">Collaboration artistique</option>
          <option value="Autre">Autre</option>
        </select>
        {errors.subject && <p className="mt-1 text-sm text-error">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Décris ta demande..."
          className="w-full resize-none rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        {errors.message && <p className="mt-1 text-sm text-error">{errors.message}</p>}
      </div>

      {errors.form && <p className="text-sm text-error">{errors.form}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_4px_32px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 disabled:opacity-50"
      >
        {pending ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
