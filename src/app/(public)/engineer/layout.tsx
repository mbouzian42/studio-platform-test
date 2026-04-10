"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkEngineerAccess } from "@/actions/engineer";

export default function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function check() {
      const access = await checkEngineerAccess();
      if (!access.success || !access.data.isEngineer) {
        router.push("/login?redirect=/engineer");
        return;
      }
      setAuthorized(true);
    }
    check();
  }, [router]);

  if (!authorized) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-bg-surface" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
