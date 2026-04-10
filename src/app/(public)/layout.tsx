import { Header } from "@/components/shared/header";
import { MobileNav } from "@/components/shared/mobile-nav";
import { Footer } from "@/components/shared/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-safe-nav md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </>
  );
}
