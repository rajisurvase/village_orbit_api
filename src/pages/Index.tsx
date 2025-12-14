import React, { useContext, lazy, Suspense, memo } from "react"; 
import Hero from "@/components/Hero";
import { VillageContext } from "@/context/VillageContextConfig";
import { usePageSEO } from "@/hooks/usePageSEO";
import HeroSkeleton from "@/components/ui/skeletons/HeroSkeleton";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";
import GallerySkeleton from "@/components/ui/skeletons/GallerySkeleton";
import { VILLAGES } from "@/config/villageConfig";
import LazySection from "@/components/LazySection";
import { useTranslation } from "react-i18next";

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
const Gallery = lazy(() => import("@/components/Gallery"));
const Contact = lazy(() => import("@/components/Contact"));
const PeopleSection = lazy(() => import("@/components/PeopleSection"));

const Index: React.FC = () => {
  const { t } = useTranslation(); 
  const { config, isPageVisible, loading } = useContext(VillageContext);
  const memoizedConfig = config;

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

  if (loading || !memoizedConfig) return <HeroSkeleton />;

  // 🔹 For debugging: log data
  console.log("memoizedConfig:", memoizedConfig);

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <Suspense fallback={<HeroSkeleton />}>
          <Hero village={memoizedConfig.village} panchayat={memoizedConfig.panchayat} />
        </Suspense>

        {/* Scroller Card Section */}
        <Suspense fallback={null}>
          <ScrollerCardSection cards={memoizedConfig.scrollerCards || []} />
        </Suspense>

        {/* News Ticker */}
        <Suspense fallback={null}>
          <NewsTicker news={memoizedConfig.newsTicker || []} />
        </Suspense>

        {/* Announcements */}
        <LazySection
          component={Announcements}
          fallback={<SectionSkeleton />}
          props={{ announcements: memoizedConfig.announcements || [] }}
        />

        {/* About */}
        <LazySection
          component={About}
          fallback={<SectionSkeleton />}
          props={{ village: memoizedConfig.village }}
        />

        {/* Panchayat */}
        <LazySection
          component={Panchayat}
          fallback={<SectionSkeleton />}
          props={{ panchayat: memoizedConfig.panchayat }}
        />

        {/* Government Staff */}
        <LazySection
          component={GovStaff}
          fallback={<SectionSkeleton />}
          props={{ govStaff: memoizedConfig.govStaff || [] }}
        />

        {/* Schemes */}
        <LazySection
          component={Schemes}
          fallback={<SectionSkeleton />}
          props={{ schemes: memoizedConfig.schemes || [] }}
        />

        {/* Services */}
        <LazySection
          component={Services}
          fallback={<SectionSkeleton />}
          props={{ services: memoizedConfig.services || [] }}
        />

        {/* Development */}
        <LazySection
          component={Development}
          fallback={<SectionSkeleton />}
          props={{ developmentWorks: memoizedConfig.developmentWorks || [] }}
        />

        {/* Proud of Our People */}
        <LazySection
          component={PeopleSection}
          fallback={<SectionSkeleton />}
          props={{
            title: t("proudPeople.title") || "Proud of Our People",
            description: t("proudPeople.description") || "People who make our village proud",
            people: memoizedConfig.proudPeople || [],
            sectionId: "proud-people",
          }}
        />

        {/* Asha Workers */}
        <LazySection
          component={PeopleSection}
          fallback={<SectionSkeleton />}
          props={{
            title: t("ashaWorkers.title") || "Asha Workers",
            description: t("ashaWorkers.description") || "Dedicated health workers",
            people: memoizedConfig.ashaWorkers || [],
            sectionId: "asha-workers",
          }}
        />

        {/* Anganwadi Workers */}
        <LazySection
          component={PeopleSection}
          fallback={<SectionSkeleton />}
          props={{
            title: t("anganwadiWorkers.title") || "Anganwadi Workers",
            description: t("anganwadiWorkers.description") || "Childcare and nutrition workers",
            people: memoizedConfig.anganwadiWorkers || [],
            sectionId: "anganwadi-workers",
          }}
        />

        {/* Gallery */}
        <LazySection
          component={Gallery}
          fallback={<GallerySkeleton />}
          props={{ gallery: memoizedConfig.gallery || [] }}
        />

        {/* Contact */}
        <LazySection
          component={Contact}
          fallback={<SectionSkeleton />}
          props={{
            contact: memoizedConfig.contact || {},
            documents: memoizedConfig.documents || [],
          }}
        />
      </main>
    </div>
  );
};

export default memo(Index);
