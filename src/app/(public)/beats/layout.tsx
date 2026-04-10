"use client";

import { useEffect } from "react";

/**
 * Beats layout — immersive mode.
 * Adds a body class to hide header, footer, and mobile nav
 * for the full-screen swipe experience.
 */
export default function BeatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add("beats-immersive");
    return () => {
      document.body.classList.remove("beats-immersive");
    };
  }, []);

  return <>{children}</>;
}
