import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CUSTOM_ROUTES } from "./custom-routes";
import Layout from "./components/Layout";
import SectionSkeleton from "./components/ui/skeletons/SectionSkeleton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UpdateNotification } from "@/components/UpdateNotification";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const VillageManagement = lazy(() => import("./pages/VillageManagement"));
const JsonConfigManager = lazy(() => import("./pages/JsonConfigManager"));
const ContactMessagesAdmin = lazy(() => import("./pages/ContactMessagesAdmin"));
const UserManagementDashboard = lazy(() => import("./pages/UserManagementDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const PanchayatPage = lazy(() => import("./pages/PanchayatPage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
//const ProudPeoplePage = lazy(() => import("@/pages/ProudPeoplePage"));


const SchemePage = lazy(() => import("./pages/SchemePage"));
const DevelopmentPage = lazy(() => import("./pages/DevelopmentPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const NoticesPage = lazy(() => import("./pages/NoticesPage"));
const MarketPricesPage = lazy(() => import("./pages/MarketPricesPage"));
const TaxPaymentPage = lazy(() => import("./pages/TaxPaymentPage"));
const TaxPaymentReceipt = lazy(() => import("./pages/TaxPaymentReceipt"));
const ForumPage = lazy(() => import("./pages/ForumPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BuySellPage = lazy(() => import("./pages/BuySellPage"));
const AdminMarketplaceDashboard = lazy(() => import("./pages/AdminMarketplaceDashboard"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const ExamDashboard = lazy(() => import("./pages/ExamDashboard"));
const ExamTake = lazy(() => import("./pages/ExamTake"));
const ExamResults = lazy(() => import("./pages/ExamResults"));
const ExamRules = lazy(() => import("./pages/ExamRules"));
const ExamAnalytics = lazy(() => import("./pages/ExamAnalytics"));
const AdminExamDashboard = lazy(() => import("./pages/AdminExamDashboard"));
const AdminExamQuestions = lazy(() => import("./pages/AdminExamQuestions"));
const AddService = lazy(() => import("./pages/AddService"));
const ManageCategories = lazy(() => import("./pages/ManageCategories"));
const ServicesAdminDashboard = lazy(() => import("./pages/ServicesAdminDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UpdateNotification />
        <BrowserRouter>
        <Suspense fallback={<SectionSkeleton />}>
          <Routes>
            {/* Auth routes without layout */}
            <Route path={CUSTOM_ROUTES.AUTH} element={<Auth />} />
          {/* Public routes with full layout and village context */}
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path={CUSTOM_ROUTES.HOME} element={<Index />} />
                  <Route path={CUSTOM_ROUTES.ABOUT} element={<AboutPage />} />
                  <Route
                    path={CUSTOM_ROUTES.SERVICES}
                    element={<ServicePage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.PANCHAYAT}
                    element={<PanchayatPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.CONTACT_US}
                    element={<ContactUsPage />}
                  />
               

                  <Route path={CUSTOM_ROUTES.SCHEME} element={<SchemePage />} />
                  <Route
                    path={CUSTOM_ROUTES.DEVELOPMENT}
                    element={<DevelopmentPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.GALLERY}
                    element={<GalleryPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.ANNOUNCEMENTS}
                    element={<AnnouncementsPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.NOTICES}
                    element={<NoticesPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.MARKET_PRICES}
                    element={<MarketPricesPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.TAX_PAYMENT}
                    element={<TaxPaymentPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.TAX_PAYMENT_RECEIPT}
                    element={<TaxPaymentReceipt />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.FORUM}
                    element={<ForumPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.BUY_SELL}
                    element={<BuySellPage />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.SELLER_DASHBOARD}
                    element={<SellerDashboard />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.ADMIN_DASHBOARD}
                    element={<AdminDashboard />}
                  />
                  <Route path="/exam" element={<ExamDashboard />} />
                  <Route path="/exam/rules" element={<ExamRules />} />
                  <Route path="/exam/analytics" element={<ExamAnalytics />} />
                  <Route path="/exam/:examId/take" element={<ExamTake />} />
                  <Route path="/exam/:examId/results/:attemptId" element={<ExamResults />} />
                  <Route path="/admin/exam-management" element={<AdminExamDashboard />} />
                  <Route path="/admin/exam/:examId/questions" element={<AdminExamQuestions />} />
                  <Route
                    path={CUSTOM_ROUTES.NOT_FOUND}
                    element={<NotFound />}
                  />
                   {/* Admin routes with basic layout (no village context) */}
                  <Route path={CUSTOM_ROUTES.ADMIN} element={<Admin />} />
                  <Route
                    path={CUSTOM_ROUTES.VILLAGE_MANAGEMENT}
                    element={<VillageManagement />}
                  />
                  <Route
                    path={CUSTOM_ROUTES.JSON_CONFIG}
                    element={<JsonConfigManager />}
                  />
                  <Route path={CUSTOM_ROUTES.CONTACT_MESSAGE} element={<ContactMessagesAdmin />} />
                  <Route path={CUSTOM_ROUTES.USER_MANAGEMENT} element={<UserManagementDashboard />} />
                  <Route path={CUSTOM_ROUTES.USER_DASHBOARD} element={<UserDashboard />} />
                  <Route path={CUSTOM_ROUTES.ADMIN_MARKETPLACE} element={<AdminMarketplaceDashboard />} />
            <Route path={CUSTOM_ROUTES.ADD_SERVICE} element={<AddService />} />
            <Route path={CUSTOM_ROUTES.MANAGE_CATEGORIES} element={<ManageCategories />} />
            <Route path={CUSTOM_ROUTES.SERVICES_ADMIN} element={<ServicesAdminDashboard />} />
                </Routes>
              </Layout>
            }
          />
          </Routes>
         </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
