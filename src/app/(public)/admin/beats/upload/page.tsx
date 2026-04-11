"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAdminAccess } from "@/actions/admin";
import { BeatUploadForm } from "@/components/beats/beat-upload-form";

export default function AdminBeatUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-bg-surface" />
          <div className="h-10 w-64 rounded bg-bg-surface" />
          <div className="h-96 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <BeatUploadForm
      backHref="/admin/beats"
      backLabel="Catalogue Beats"
      redirectTo="/admin/beats"
    />
  );
}
