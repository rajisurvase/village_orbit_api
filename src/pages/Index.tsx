import React, { useContext, useEffect, lazy, Suspense, memo, useMemo } from "react"; 
import Hero from "@/components/Hero";
import { VillageContext } from "@/context/VillageContextConfig";
import { usePageSEO } from "@/hooks/usePageSEO";
import HeroSkeleton from "@/components/ui/skeletons/HeroSkeleton";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";
import { VILLAGES } from "@/config/villageConfig";
import LazySection from "@/components/LazySection";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* Lazy-loaded components */
const ScrollerCardSection = lazy(() => import("@/components/ScrollerCardSection"));
const NewsTicker = lazy(() => import("@/components/NewsTicker"));
const About = lazy(() => import("@/components/About"));
const Panchayat = lazy(() => import("@/components/Panchayat"));
const GovStaff = lazy(() => import("@/components/GovStaff"));
const Announcements = lazy(() => import("@/components/Announcements"));
const Schemes = lazy(() => import("@/components/Schemes"));
const Services = lazy(() => import("@/components/Services"));
const Development = lazy(() => import("@/components/Development"));
const Contact = lazy(() => import("@/components/Contact"));
const PeopleSection = lazy(() => import("@/components/PeopleSection"));

// Memoized worker normalizer to prevent recreation
const normalizeWorkers = (list: { name?: string; image?: string; profession?: string; description?: string }[] = []) =>
  list.map((p) => ({
    name: p.name ?? '',
    image: p.image ?? '',
    profession: p.profession ?? '',
    description: p.description ?? '',
  }));

const Index: React.FC = () => {
  const { t } = useTranslation(); 
  const { config, loading } = useContext(VillageContext);
  const location = useLocation();

  // Scroll to hash on navigation
  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");
    const timeout = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -120; // header height
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [location.hash]);

  // SEO configuration
  usePageSEO({
    title: `${VILLAGES.shivankhed.name} Gram Panchayat | Official Website`,
    description: `Official website of ${VILLAGES.shivankhed.name} Gram Panchayat. Access government schemes, development projects, announcements, services, and contact information.`,
    keywords: [
      "gram panchayat",
      "village website",
      "government schemes",
      "development projects",
      "village services",
      VILLAGES.shivankhed.name,
    ],
    canonical: "https://shivankhedkhurd.vercel.app",
  });

  // Memoize normalized workers to prevent recreation on every render
  const ashaWorkers = useMemo(() => {
    const configAny = config as unknown as { people?: { ashaWorkers?: unknown[] }; ashaWorkers?: unknown[] } | null;
    const workers = configAny?.ashaWorkers || configAny?.people?.ashaWorkers || [];
    return normalizeWorkers(workers as { name?: string; image?: string; profession?: string; description?: string }[]);
  }, [config]);

  const anganwadiWorkers = useMemo(() => {
    const configAny = config as unknown as { people?: { anganwadiWorkers?: unknown[] }; anganwadiWorkers?: unknown[] } | null;
    const workers = configAny?.anganwadiWorkers || configAny?.people?.anganwadiWorkers || [];
    return normalizeWorkers(workers as { name?: string; image?: string; profession?: string; description?: string }[]);
  }, [config]);

  // Memoize section props to prevent unnecessary re-renders
  const heroProps = useMemo(() => ({
    village: config?.village,
    panchayat: config?.panchayat,
  }), [config?.village, config?.panchayat]);

  const contactProps = useMemo(() => ({
    contact: config?.contact || {},
    documents: config?.documents || [],
  }), [config?.contact, config?.documents]);

  const proudPeopleProps = useMemo(() => ({
    title: t("proudPeople.title") || "Proud of Our People",
    description: t("proudPeople.description") || "People who make our village proud",
    people: config?.proudPeople || [],
    sectionId: "proud-people",
  }), [t, config?.proudPeople]);

  if (loading || !config) return <HeroSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <Suspense fallback={<HeroSkeleton />}>
          <Hero {...heroProps} />
        </Suspense>

        {/* Scroller Card Section */}
        <Suspense fallback={null}>
          <ScrollerCardSection cards={config.scrollerCards || []} />
        </Suspense>

        {/* News Ticker */}
        <Suspense fallback={null}>
          <NewsTicker news={config.newsTicker || []} />
        </Suspense>

        {/* Announcements */}
        <LazySection
          component={Announcements}
          fallback={<SectionSkeleton />}
          props={{ announcements: config.announcements || [] }}
        />

        {/* About */}
        <LazySection
          component={About}
          fallback={<SectionSkeleton />}
          props={{ village: config.village }}
        />

        {/* Panchayat */}
        <LazySection
          component={Panchayat}
          fallback={<SectionSkeleton />}
          props={{ panchayat: config.panchayat }}
        />

        {/* Government Staff */}
        <LazySection
          component={GovStaff}
          fallback={<SectionSkeleton />}
          props={{ govStaff: config.govStaff || [] }}
        />
        
        {/* Services */}
        <LazySection
          component={Services}
          fallback={<SectionSkeleton />}
          props={{ services: config.services || [] }}
        />

        {/* Schemes */}
        <LazySection
          component={Schemes}
          fallback={<SectionSkeleton />}
          props={{ schemes: config.schemes || [] }}
        />


        {/* Development */}
        <LazySection
          component={Development}
          fallback={<SectionSkeleton />}
          props={{ developmentWorks: config.developmentWorks || [] }}
        />

        {/* Proud of Our People */}
        <LazySection
          component={PeopleSection}
          fallback={<SectionSkeleton />}
          props={proudPeopleProps}
        />

        {/* ASHA Workers */}
        {ashaWorkers.length > 0 && (
          <PeopleSection
            title="Asha Workers"
            description="Village health workers"
            people={ashaWorkers}
            sectionId="asha"
          />
        )}

        {/* Anganwadi Workers */}
        {anganwadiWorkers.length > 0 && (
          <PeopleSection
            title="Anganwadi Workers"
            description="Child nutrition and care workers"
            people={anganwadiWorkers}
            sectionId="anganwadi"
          />
        )}

        {/* Contact */}
        <LazySection
          component={Contact}
          fallback={<SectionSkeleton />}
          props={contactProps}
        />
      </main>
    </div>
  );
};

export default memo(Index);
