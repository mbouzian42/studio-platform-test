"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Save } from "lucide-react";
import { checkAdminAccess } from "@/actions/admin";
import {
  getAdminEngineers,
  updateEngineerPriority,
  toggleEngineerAvailability,
} from "@/actions/admin-mixing";
import { toast } from "@/components/ui/toaster";
import type { Engineer } from "@/types";

type EngineerWithName = Engineer & { profile_name: string };

export default function AdminEngineersPage() {
  const router = useRouter();
  const [engineers, setEngineers] = useState<EngineerWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPriority, setEditPriority] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      const result = await getAdminEngineers();
      if (result.success) {
        setEngineers(result.data);
        const priorities: Record<string, number> = {};
        for (const e of result.data) {
          priorities[e.id] = e.priority_order;
        }
        setEditPriority(priorities);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSavePriority(engineerId: string) {
    const priority = editPriority[engineerId];
    if (priority === undefined) return;

    const result = await updateEngineerPriority(engineerId, priority);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Priorité mise à jour", variant: "success" });
  }

  async function handleToggle(engineerId: string, current: boolean) {
    const result = await toggleEngineerAvailability(engineerId, !current);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setEngineers((prev) =>
      prev.map((e) =>
        e.id === engineerId ? { ...e, is_available: !current } : e,
      ),
    );
    toast({
      title: !current ? "Ingénieur disponible" : "Ingénieur indisponible",
      variant: "success",
    });
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-bg-surface" />
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
        Gestion des Ingénieurs
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {engineers.length} ingénieur{engineers.length > 1 ? "s" : ""} du son
      </p>

      <div className="mt-8 space-y-4">
        {engineers.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <User className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">
              Aucun ingénieur configuré
            </p>
          </div>
        ) : (
          engineers.map((eng) => (
            <div
              key={eng.id}
              className="rounded-lg border border-border-subtle bg-bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-magenta-500">
                    <span className="font-display font-bold text-white">
                      {eng.profile_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-display font-semibold">
                      {eng.profile_name}
                    </p>
                    {eng.specialties.length > 0 && (
                      <p className="text-xs text-text-muted">
                        {eng.specialties.join(", ")}
                      </p>
                    )}
                    {eng.bio && (
                      <p className="mt-1 text-xs text-text-secondary line-clamp-1">
                        {eng.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Availability toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(eng.id, eng.is_available)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    eng.is_available
                      ? "bg-success/20 text-success"
                      : "bg-error/20 text-error"
                  }`}
                >
                  {eng.is_available ? "Disponible" : "Indisponible"}
                </button>
              </div>

              {/* Priority */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-text-muted">Priorité :</span>
                <input
                  type="number"
                  min={1}
                  value={editPriority[eng.id] ?? eng.priority_order}
                  onChange={(e) =>
                    setEditPriority((prev) => ({
                      ...prev,
                      [eng.id]: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-16 rounded border border-border-subtle bg-bg-primary px-2 py-1 text-center text-xs font-bold"
                />
                {editPriority[eng.id] !== eng.priority_order && (
                  <button
                    type="button"
                    onClick={() => handleSavePriority(eng.id)}
                    className="flex items-center gap-1 rounded bg-brand-gradient px-2 py-1 text-xs font-semibold text-white"
                  >
                    <Save className="h-3 w-3" />
                    Sauver
                  </button>
                )}
                <span className="text-[10px] text-text-muted">
                  (1 = assigné en premier)
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
