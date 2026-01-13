import { useState, useContext, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import {
  Menu,
  X,
  Shield,
  LogIn,
  LogOut,
  User,
  ChevronRight,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

import { useAuth } from "@/hooks/useAuth";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { supabase } from "@/integrations/supabase/client";
import { CUSTOM_ROUTES } from "@/custom-routes";
import { VillageContext } from "@/context/VillageContextConfig";
import { cn } from "@/lib/utils";
import { getDefaultNavigationConfig } from "@/hooks/useNavigationConfig";

// Header.tsx (top)
type Visible =
  | "proudPeople"
  | "ashaWorkers"
  | "anganwadiWorkers"
  | "about"
  | "panchayat"
  | "schemes"
  | "services"
  | "development"
  // "gallery"
  | "contact"
  | "announcement";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [desktopHomeOpen, setDesktopHomeOpen] = useState(false);

  const { t, i18n } = useTranslation();
  const { user, isAdmin, isSubAdmin } = useAuth();
  const { isPageVisible } = usePageVisibility();
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useContext(VillageContext);

  const navConfig = (config as any)?.navigationConfig || null;
  const currentLang = (i18n.language?.split("-")[0] || "en") as
    | "en"
    | "hi"
    | "mr";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate("/");
  };

  const navigationData = useMemo(() => {
    const configToUse = navConfig || getDefaultNavigationConfig();

    const standaloneNavItems = configToUse.standaloneItems
      .filter((item) => item.isVisible && isPageVisible(item.pageKey))
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        name: item.label[currentLang] || item.label.en,
        href: item.href,
        pageKey: item.pageKey,
      }));

    const homeMenuSections = configToUse.homeMenuSections
      .filter((section) => section.isVisible)
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        title: section.title[currentLang] || section.title.en,
        items: section.items
          .filter((item) => item.isVisible && isPageVisible(item.pageKey))
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            name: item.label[currentLang] || item.label.en,
            href: item.href,
            pageKey: item.pageKey,
          })),
      }))
      .filter((section) => section.items.length > 0);

    return { standaloneNavItems, homeMenuSections };
  }, [navConfig, currentLang, isPageVisible]);

  const { standaloneNavItems, homeMenuSections } = navigationData;

  // ------------------------------------------------------------------
  // YELLOW CONTACT BAR (NON-STICKY)
  // ------------------------------------------------------------------
  const YellowBar = config?.contact?.office && (
    <div
      className="w-full bg-[#F2CB4A] text-black py-2 px-3 sm:py-2.5 sm:px-4 md:py-3 md:px-6
        flex flex-wrap items-center justify-center gap-2 sm:gap-3
        md:flex-row md:justify-between md:gap-4
        text-xs sm:text-sm
      "
    >
      {/* Phone & Email Container */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6">
        {/* Phone */}
        <a 
          href={`tel:${config.contact.office.phone}`}
          className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
        >
          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">{config.contact.office.phone}</span>
        </a>

        {/* Email */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-none">{config.contact.office.email}</span>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {config?.social?.instagram && (
          <a 
            href={config.social.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </a>
        )}
        {config?.social?.facebook && (
          <a 
            href={config.social.facebook} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </a>
        )}
        {config?.social?.youtube && (
          <a 
            href={config.social.youtube} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </a>
        )}

        <button
          onClick={() =>
            navigator.share && navigator.share({ url: window.location.href })
          }
          className="hover:opacity-80 transition-opacity"
        >
          <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
        </button>
      </div>
    </div>
  );

  const sections: Visible[] = [
    "about",
    "panchayat",
    "schemes",
    "services",
    "development",
    //"gallery",
    "contact",
    "announcement",
    "proudPeople",
    "ashaWorkers",
    "anganwadiWorkers",
  ];
  // ------------------------------------------------------------------
  // WHITE HEADER (STICKY)
  // ------------------------------------------------------------------
  return (
    <>
      {/* YELLOW BAR ABOVE HEADER */}
      {YellowBar}

      {/* WHITE HEADER (STICKY) */}
      <header className="sticky top-0 z-[200] w-full bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-2 sm:py-2.5 md:py-3 gap-2 sm:gap-3">
            {/* Logo */}
            <Link to={CUSTOM_ROUTES.HOME} className="flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                  <LazyLoadImage
                    src="/favicon.ico"
                    alt="App Logo"
                    effect="blur"
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
                    {t("header.title")}
                  </h1>
                  {config?.village && (
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[160px] md:max-w-none">
                      {config.village.state}{config.village.district && `, ${config.village.district}`}
                    </p>
                  )}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 relative">
                {/* HOME Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:text-primary hover:bg-primary/10 text-sm xl:text-base px-2 xl:px-3"
                    onClick={() => setDesktopHomeOpen(!desktopHomeOpen)}
                  >
                    {t("header.home")}
                  </Button>

                  {desktopHomeOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDesktopHomeOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-72 xl:w-80 bg-card border border-border rounded-lg shadow-lg z-50 p-3 xl:p-4 max-h-[70vh] overflow-y-auto">
                        <Accordion
                          type="single"
                          collapsible
                          className="space-y-1"
                        >
                          {homeMenuSections.map((section, idx) => (
                            <AccordionItem
                              key={section.title}
                              value={`section-${idx}`}
                              className="border-b border-border last:border-0"
                            >
                              <AccordionTrigger className="text-foreground hover:text-primary py-2.5 px-2 hover:no-underline [&[data-state=open]>svg]:rotate-90">
                                <div className="flex items-center gap-2 text-sm">
                                  <ChevronRight className="h-4 w-4 transition-transform flex-shrink-0" />
                                  <span className="truncate">{section.title}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-6 pr-2 space-y-0.5">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setDesktopHomeOpen(false)}
                                    className={cn(
                                      "block py-2 px-3 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground truncate",
                                      location.pathname === item.href &&
                                        "bg-accent text-accent-foreground"
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </>
                  )}
                </div>

                {/* Normal Navigation */}
                {standaloneNavItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-foreground hover:text-primary hover:bg-primary/10 text-sm xl:text-base px-2 xl:px-3",
                      location.pathname === item.href &&
                        "bg-primary/10 text-primary"
                    )}
                    asChild
                  >
                    <Link to={item.href}>{item.name}</Link>
                  </Button>
                ))}
              </nav>

              {/* Language + Theme */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <ThemeToggle />
                <LanguageToggle />
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                {user ? (
                  <>
                    {isAdmin || isSubAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-sm px-2 xl:px-3"
                        onClick={() => navigate("/admin/dashboard")}
                      >
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden xl:inline">{t("header.admin")}</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-sm px-2 xl:px-3"
                        onClick={() => navigate(CUSTOM_ROUTES.USER_DASHBOARD)}
                      >
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden xl:inline">{t("header.myProfile")}</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-sm px-2 xl:px-3"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden xl:inline">{t("header.logout")}</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 text-sm px-2 xl:px-3"
                    onClick={() => navigate("/auth")}
                  >
                    <LogIn className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden xl:inline">{t("header.login")}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen &&
          createPortal(
            <>
              <div
                className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              />

              <nav className="fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-card shadow-2xl z-[9999] lg:hidden overflow-y-auto border-l border-border">
                {/* Close button */}
                <div className="sticky top-0 bg-card border-b border-border p-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{t("header.home")}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-1 p-3">
                  <Accordion type="single" collapsible className="space-y-0.5">
                    {homeMenuSections.map((section, idx) => (
                      <AccordionItem
                        key={section.title}
                        value={`section-${idx}`}
                        className="border-b border-border last:border-0"
                      >
                        <AccordionTrigger className="py-2.5 px-2 text-foreground hover:text-primary [&[data-state=open]>svg]:rotate-90">
                          <div className="flex items-center gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{section.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-6 pr-2 space-y-0.5 pb-2">
                          {section.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={cn(
                                "block py-2 px-3 text-sm rounded-md hover:bg-accent transition-colors truncate",
                                location.pathname === item.href &&
                                  "bg-accent text-accent-foreground"
                              )}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <div className="border-t border-border pt-2 mt-2 space-y-0.5">
                    {standaloneNavItems.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-foreground hover:text-primary text-sm h-10",
                          location.pathname === item.href &&
                            "bg-primary/10 text-primary"
                        )}
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link to={item.href}>{item.name}</Link>
                      </Button>
                    ))}
                  </div>

                  {/* Auth Buttons */}
                  <div className="border-t border-border pt-3 mt-3 space-y-2">
                    {user ? (
                      <>
                        {isAdmin || isSubAdmin ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 h-10"
                            onClick={() => {
                              navigate("/admin/dashboard");
                              setIsMenuOpen(false);
                            }}
                          >
                            <Shield className="h-4 w-4 flex-shrink-0" />
                            {t("header.admin")}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 h-10"
                            onClick={() => {
                              navigate(CUSTOM_ROUTES.USER_DASHBOARD);
                              setIsMenuOpen(false);
                            }}
                          >
                            <User className="h-4 w-4 flex-shrink-0" />
                            {t("header.myProfile")}
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-2 h-10"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 flex-shrink-0" />
                          {t("header.logout")}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-2 h-10"
                        onClick={() => {
                          navigate("/auth");
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogIn className="h-4 w-4 flex-shrink-0" />
                        {t("header.login")}
                      </Button>
                    )}
                  </div>
                </div>
              </nav>
            </>,
            document.body
          )}
      </header>
    </>
  );
};

export default memo(Header);
