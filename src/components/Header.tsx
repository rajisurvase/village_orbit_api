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
import SocialMediaButtons from "./SocialMediaButtons";
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
  
  // Get navigation config from village config if available
  const navConfig = (config as any)?.navigationConfig || null;
  const currentLang = (i18n.language?.split('-')[0] || 'en') as 'en' | 'hi' | 'mr';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  // Get navigation items from config or use defaults
  const navigationData = useMemo(() => {
    const configToUse = navConfig || getDefaultNavigationConfig();
    
    // Standalone navigation items (not in HOME dropdown)
    const standaloneNavItems = configToUse.standaloneItems
      .filter(item => item.isVisible && isPageVisible(item.pageKey))
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        name: item.label[currentLang] || item.label.en,
        href: item.href,
        pageKey: item.pageKey
      }));

    // HOME dropdown menu structure
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

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm safe-area-top">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Main Header email contact number social icons */}

        {config?.contact?.office && (
          <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between py-2 text-sm text-muted-foreground border-b border-border/50 gap-2">
           
           {/*} <div className="sm:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a 
                  href={`tel:${config.contact.office.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {config.contact.office.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{config.contact.office.email}</span>
              </div>
            </div>*/}
            {/* Social Media Icons 
            <SocialMediaButtons
              social={config?.social}
              className="hidden lg:flex"
            />*/}
            {/*<div className="text-sm">{config.contact.office.hours}</div>*/}
          </div>
        )}
        <div className="flex items-center justify-between py-2.5 sm:py-3 md:py-4">
          {/* Logo & Title */}
      <Link to={CUSTOM_ROUTES.HOME}>
  <div className="flex items-center gap-4">
<div className="w-14 h-14 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex items-center justify-center">
  <LazyLoadImage
    src="/logo1.png"
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
          {config.village.state} {config.village.district && ","}{" "}
          {config.village.district}
        </p>
      )}
    </div>

  </div>
</Link>

         

          {/* Desktop Navigation & Auth */}
          <div className="flex items-center gap-2">
            <nav className="hidden lg:flex items-center gap-0.5 relative">
              {/* HOME Accordion Menu */}
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
                                    location.pathname === item.href && "bg-accent text-accent-foreground"
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

              {/* Standalone Navigation Items */}
              {standaloneNavItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    "text-foreground hover:text-primary hover:bg-primary/10",
                    location.pathname === item.href && "bg-primary/10 text-primary"
                  )}
                  asChild
                >
                  <Link to={item.href}>{item.name}</Link>
                </Button>
              ))}
            </nav>
             {/* Left side: Language, Theme & Social */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
            {/* <SocialMediaButtons social={config?.social} className="hidden lg:flex" /> */}
          </div>
            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  {isAdmin || isSubAdmin ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin/dashboard")}
                      className="gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(CUSTOM_ROUTES.USER_DASHBOARD)}
                      className="gap-2"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
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

      {/* Mobile Navigation - Rendered via Portal at document root */}
      {isMenuOpen &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sidebar */}
            <nav className="fixed top-0 right-0 h-full w-72 bg-card shadow-2xl z-[9999] lg:hidden animate-slide-in-right overflow-y-auto border-l border-border">
              <div className="flex flex-col gap-2 p-4">
                {/* HOME Accordion for Mobile */}
                <div className="mb-2">
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
                              onClick={() => setIsMenuOpen(false)}
                              className={cn(
                                "block py-2 px-3 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                                location.pathname === item.href && "bg-accent text-accent-foreground"
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

                {/* Standalone Navigation Items for Mobile */}
                {standaloneNavItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "justify-start text-foreground hover:text-primary hover:bg-primary/10",
                      location.pathname === item.href && "bg-primary/10 text-primary"
                    )}
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to={item.href}>{item.name}</Link>
                  </Button>
                ))}

                {/* Mobile Auth Buttons */}
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

                {/* Mobile Social Media */}
                {config?.social && (
                  <div className="flex justify-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <ThemeToggle />
                      <SocialMediaButtons
                        social={config.social}
                        className="flex"
                      />
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </>,
          document.body
        )}
    </header>
  );
};

export default memo(Header);
