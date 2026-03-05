import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Update document title for SEO
    document.title = "404 - Page Not Found | Gram Panchayat";
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-subtle">
      <article className="text-center p-8">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-8 text-2xl text-muted-foreground">Oops! Page not found or you don't have permission to access it.</p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </article>
    </main>
  );
};

export default NotFound;
