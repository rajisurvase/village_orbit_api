import React from "react";
import { useVillages } from "@/hooks/useVillagehooks";
import { getVillageSubdomainUrl, createSlugFromName } from "@/lib/subdomainUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageSEO } from "@/hooks/usePageSEO";

const VillageLandingPage: React.FC = () => {
  // const { data: villages, isLoading, error } = useVillages();

  // Set page SEO
  usePageSEO({
    title: "VillageOrbit",
    description: "Select a village to access its government services, schemes, development projects, and announcements",
    keywords: ["villages", "gram panchayat", "village services", "government schemes"],
    canonical: typeof window !== "undefined" ? window.location.href : "",
  });

  const handleSelectVillage = (villageName: string) => {
    const slug = createSlugFromName(villageName);
    const subdomainUrl = getVillageSubdomainUrl(slug);
    window.location.href = subdomainUrl;
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
  //       <div className="max-w-6xl mx-auto">
  //         <div className="text-center mb-12">
  //           <Skeleton className="h-12 w-64 mx-auto mb-4" />
  //           <Skeleton className="h-6 w-96 mx-auto" />
  //         </div>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //           {[...Array(6)].map((_, i) => (
  //             <Skeleton key={i} className="h-64 rounded-lg" />
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
  //       <div className="text-center">
  //         <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Villages</h1>
  //         <p className="text-gray-600 mb-6">Unable to fetch the village list. Please try again later.</p>
  //         <Button onClick={() => window.location.reload()}>Retry</Button>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!villages || villages.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
  //       <div className="text-center">
  //         <h1 className="text-3xl font-bold text-gray-800 mb-4">No Villages Found</h1>
  //         <p className="text-gray-600">Currently no villages are available in the system.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">🌾 VillageOrbit</h1>
          <p className="text-xl text-green-100 mb-2">Connecting Villages, Empowering Communities</p>
          <p className="text-green-50">Select your village to access government services, schemes, and updates</p>
        </div>
      </div>
      {/* Footer Info */}
      <div className="bg-gray-800 text-gray-100 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            VillageOrbit - Bridging the gap between villages and digital services
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date().getFullYear()} © All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default VillageLandingPage;
