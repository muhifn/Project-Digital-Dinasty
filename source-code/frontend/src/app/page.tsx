import PublicHomePage from "@/app/(public)/page";
import { PublicLayout } from "@/components/layout/public-layout";

export default function HomePage() {
  return (
    <PublicLayout>
      <PublicHomePage />
    </PublicLayout>
  );
}
