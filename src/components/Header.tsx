import { useState, useContext, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

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
  Share2
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


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [desktopHomeOpen, setDesktopHomeOpen] = useState(false);

  const { t, i18n } = useTranslation();
  const { user, isAdmin, isSubAdmin } = useAuth();
  const { isPageVisible } = usePageVisibility();
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useContext(VillageContext);

  const navConfig = (config as any)?.navigationConfig || null;
  const currentLang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'hi' | 'mr';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const navigationData = useMemo(() => {
    const configToUse = navConfig || getDefaultNavigationConfig();

    const standaloneNavItems = configToUse.standaloneItems
      .filter(item => item.isVisible && isPageVisible(item.pageKey))
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        name: item.label[currentLang] || item.label.en,
        href: item.href,
        pageKey: item.pageKey
      }));

    const homeMenuSections = configToUse.homeMenuSections
      .filter(section => section.isVisible)
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        title: section.title[currentLang] || section.title.en,
        items: section.items
          .filter(item => item.isVisible && isPageVisible(item.pageKey))
          .sort((a, b) => a.order - b.order)
          .map(item => ({
            name: item.label[currentLang] || item.label.en,
            href: item.href,
            pageKey: item.pageKey
          }))
      }))
      .filter(section => section.items.length > 0);

    return { standaloneNavItems, homeMenuSections };
  }, [navConfig, currentLang, isPageVisible]);

  const { standaloneNavItems, homeMenuSections } = navigationData;


  // ------------------------------------------------------------------
  // YELLOW CONTACT BAR (NON-STICKY)
  // ------------------------------------------------------------------
  const YellowBar = (
    config?.contact?.office && (
      <div className="w-full bg-[#F2CB4A] text-black py-3 px-4
        flex flex-col items-center text-center gap-3
        lg:flex-row lg:text-left lg:items-center lg:justify-between lg:gap-6
      ">
        {/* Phone */}
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <Phone className="h-4 w-4" />
          <a href={`tel:${config.contact.office.phone}`}>
            {config.contact.office.phone}
          </a>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <Mail className="h-4 w-4" />
          <span>{config.contact.office.email}</span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4 justify-center lg:justify-end">
          {config?.social?.instagram && (
            <a href={config.social.instagram} target="_blank">
              <Instagram className="h-6 w-6 text-black" />
            </a>
          )}
          {config?.social?.facebook && (
            <a href={config.social.facebook} target="_blank">
              <Facebook className="h-6 w-6 text-black" />
            </a>
          )}
          {config?.social?.youtube && (
            <a href={config.social.youtube} target="_blank">
              <Youtube className="h-6 w-6 text-black" />
            </a>
          )}

          <button
            onClick={() =>
              navigator.share && navigator.share({ url: window.location.href })
            }
          >
            <Share2 className="h-6 w-6 text-black" />
          </button>
        </div>
      </div>
    )
  );


  // ------------------------------------------------------------------
  // WHITE HEADER (STICKY)
  // ------------------------------------------------------------------
  return (
    <>
      {/* YELLOW BAR ABOVE HEADER */}
      {YellowBar}

      {/* WHITE HEADER (STICKY) */}
      <header className="sticky top-0 z-[200] w-full bg-card/95 backdrop-blur-md border-b border-border shadow-sm">

        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-2.5 sm:py-3 md:py-4">

            {/* Logo */}
            <Link to={CUSTOM_ROUTES.HOME}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full overflow-hidden">
                  <LazyLoadImage
                    src="/favicon.ico"
                    alt="Logo"
                    effect="blur"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {t("header.title")}
                  </h1>
                  {config?.village && (
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      {config.village.state} {config.village.district && ","}
                      {" "}
                      {config.village.district}
                    </p>
                  )}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-2">
              <nav className="hidden lg:flex items-center gap-0.5 relative">

                {/* HOME Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => setDesktopHomeOpen(!desktopHomeOpen)}
                  >
                    Home
                  </Button>

                  {desktopHomeOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDesktopHomeOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
                        <Accordion type="single" collapsible className="space-y-2">
                          {homeMenuSections.map((section, idx) => (
                            <AccordionItem
                              key={section.title}
                              value={`section-${idx}`}
                              className="border-b border-border last:border-0"
                            >
                              <AccordionTrigger className="text-foreground hover:text-primary py-3 px-2 hover:no-underline [&[data-state=open]>svg]:rotate-90">
                                <div className="flex items-center gap-2 text-sm">
                                  <ChevronRight className="h-4 w-4 transition-transform" />
                                  <span>{section.title}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-8 pr-2 space-y-1">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setDesktopHomeOpen(false)}
                                    className={cn(
                                      "block py-2 px-3 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
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
                    className={cn(
                      "text-foreground hover:text-primary hover:bg-primary/10",
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
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <LanguageToggle />
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <>
                    {isAdmin || isSubAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate("/admin/dashboard")}
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate(CUSTOM_ROUTES.USER_DASHBOARD)}
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate("/auth")}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                )}
              </div>

            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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

              <nav className="fixed top-0 right-0 h-full w-72 bg-card shadow-2xl z-[9999] lg:hidden overflow-y-auto border-l border-border p-4">
                <div className="flex flex-col gap-2">

                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
                    Home
                  </div>

                  <Accordion type="single" collapsible className="space-y-1">
                    {homeMenuSections.map((section, idx) => (
                      <AccordionItem
                        key={section.title}
                        value={`section-${idx}`}
                        className="border-b border-border last:border-0"
                      >
                        <AccordionTrigger className="py-3 px-2 text-foreground hover:text-primary [&[data-state=open]>svg]:rotate-90">
                          <div className="flex items-center gap-2 text-sm">
                            <ChevronRight className="h-4 w-4" />
                            <span>{section.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8 pr-2 space-y-1">
                          {section.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={cn(
                                "block py-2 px-3 text-sm rounded-md hover:bg-accent",
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

                  {standaloneNavItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={cn(
                        "justify-start text-foreground hover:text-primary",
                        location.pathname === item.href &&
                        "bg-primary/10 text-primary"
                      )}
                      asChild
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link to={item.href}>{item.name}</Link>
                    </Button>
                  ))}

                  <div className="mt-4 space-y-2">
                    {user ? (
                      <>
                        {isAdmin || isSubAdmin ? (
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => {
                              navigate("/admin/dashboard");
                              setIsMenuOpen(false);
                            }}
                          >
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => {
                              navigate(CUSTOM_ROUTES.USER_DASHBOARD);
                              setIsMenuOpen(false);
                            }}
                          >
                            <User className="h-4 w-4" />
                            My Profile
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className="w-full gap-2"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full gap-2"
                        onClick={() => {
                          navigate("/auth");
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogIn className="h-4 w-4" />
                        Login
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
