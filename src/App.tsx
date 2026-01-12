import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, ComponentType } from "react";
import { CUSTOM_ROUTES } from "./custom-routes";
import Layout from "./components/Layout";
import SectionSkeleton from "./components/ui/skeletons/SectionSkeleton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UpdateNotification } from "@/components/UpdateNotification";

// Helper function to retry failed dynamic imports (handles cache issues)
const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // If import fails, try to reload the page to get fresh assets
      console.warn('Dynamic import failed, retrying...', error);
      // Clear cache and retry once
      return componentImport().catch(() => {
        // If still failing, force reload
        window.location.reload();
        return { default: (() => null) as unknown as T };
      });
    }
  });

// Lazy load pages for code splitting with retry mechanism
const Index = lazyWithRetry(() => import("./pages/Index"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const VillageManagement = lazyWithRetry(() => import("./pages/VillageManagement"));
const JsonConfigManager = lazyWithRetry(() => import("./pages/JsonConfigManager"));
const ContactMessagesAdmin = lazyWithRetry(() => import("./pages/ContactMessagesAdmin"));
const UserManagementDashboard = lazyWithRetry(() => import("./pages/UserManagementDashboard"));
const UserDashboard = lazyWithRetry(() => import("./pages/UserDashboard"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const AboutPage = lazyWithRetry(() => import("./pages/AboutPage"));
const ServicePage = lazyWithRetry(() => import("./pages/ServicePage"));
const PanchayatPage = lazyWithRetry(() => import("./pages/PanchayatPage"));
const ContactUsPage = lazyWithRetry(() => import("./pages/ContactUsPage"));
const DocumentsModel = lazyWithRetry(() => import("./pages/DocumentsModel"));

const SchemePage = lazyWithRetry(() => import("./pages/SchemePage"));
const GovtSchemesPage = lazyWithRetry(() => import("./pages/GovtSchemesPage"));
const DevelopmentPage = lazyWithRetry(() => import("./pages/DevelopmentPage"));
const MediaGalleryPage = lazyWithRetry(() => import("./pages/MediaGalleryPage"));
const AnnouncementsPage = lazyWithRetry(() => import("./pages/AnnouncementsPage"));
const NoticesPage = lazyWithRetry(() => import("./pages/NoticesPage"));
const MarketPricesPage = lazyWithRetry(() => import("./pages/MarketPricesPage"));
const TaxPaymentPage = lazyWithRetry(() => import("./pages/TaxPaymentPage"));
const TaxPaymentReceipt = lazyWithRetry(() => import("./pages/TaxPaymentReceipt"));
const ForumPage = lazyWithRetry(() => import("./pages/ForumPage"));
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const BuySellPage = lazyWithRetry(() => import("./pages/BuySellPage"));
const AdminMarketplaceDashboard = lazyWithRetry(() => import("./pages/AdminMarketplaceDashboard"));
const SellerDashboard = lazyWithRetry(() => import("./pages/SellerDashboard"));
const ExamDashboard = lazyWithRetry(() => import("./pages/ExamDashboard"));
const ExamTake = lazyWithRetry(() => import("./pages/ExamTake"));
const ExamResults = lazyWithRetry(() => import("./pages/ExamResults"));
const ExamRules = lazyWithRetry(() => import("./pages/ExamRules"));
const ExamAnalytics = lazyWithRetry(() => import("./pages/ExamAnalytics"));
const AdminExamDashboard = lazyWithRetry(() => import("./pages/AdminExamDashboard"));
const AdminExamQuestions = lazyWithRetry(() => import("./pages/AdminExamQuestions"));
const AdminExamReports = lazyWithRetry(() => import("./pages/AdminExamReports"));
const AddService = lazyWithRetry(() => import("./pages/AddService"));
const ManageCategories = lazyWithRetry(() => import("./pages/ManageCategories"));
const ServicesAdminDashboard = lazyWithRetry(() => import("./pages/ServicesAdminDashboard"));
const NavigationConfigEditor = lazyWithRetry(() => import("./pages/NavigationConfigEditor"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UpdateNotification />
        
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
                  <Route path={CUSTOM_ROUTES.GOVT_SCHEMES} element={<GovtSchemesPage />} />
                  <Route
                    path={CUSTOM_ROUTES.DEVELOPMENT}
                    element={<DevelopmentPage />}
                  />
                  {/*<Route
                    path={CUSTOM_ROUTES.GALLERY}
                    element={<GalleryPage />}
                  />*/}
                  <Route
                    path={CUSTOM_ROUTES.MEDIA_GALLERY}
                    element={<MediaGalleryPage />}
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
                  <Route path="/documents" element={<DocumentsModel />} />

                  <Route path="/exam" element={<ExamDashboard />} />
                  <Route path="/exam/rules" element={<ExamRules />} />
                  <Route path="/exam/analytics" element={<ExamAnalytics />} />
                  <Route path="/exam/:examId/take" element={<ExamTake />} />
                  <Route path="/exam/:examId/results/:attemptId" element={<ExamResults />} />
                  <Route path="/admin/exam-management" element={<AdminExamDashboard />} />
                  <Route path="/admin/exam/:examId/questions" element={<AdminExamQuestions />} />
                  <Route path="/admin/exam-reports" element={<AdminExamReports />} />
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
            <Route path={CUSTOM_ROUTES.NAVIGATION_CONFIG} element={<NavigationConfigEditor />} />
                </Routes>
              </Layout>
            }
          />
          </Routes>
         </Suspense>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
