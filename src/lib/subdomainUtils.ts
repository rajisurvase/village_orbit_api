/**
 * Subdomain Detection Utility
 * Handles extraction and parsing of village slugs from subdomains
 */

/**
 * Extracts the subdomain slug from the current hostname
 * Examples:
 * - shivankhed-khurd.villageorbit.in -> "shivankhed-khurd"
 * - localhost:5173 -> null (local development)
 * - villageorbit.in -> null (main domain)
 */
export const getSubdomainSlug = (): string | null => {
  if (typeof window === "undefined") {
    return null; // SSR safety
  }

  const hostname = window.location.hostname;

  // Handle localhost and development environments
  if (hostname === "localhost" || hostname.startsWith("127.")) {
    // In development, you can use query params or localStorage
    // For now, check localStorage or return null for main domain
    const devVillage = localStorage.getItem("dev_village_slug");
    return devVillage || null;
  }

  // Split hostname by dots
  const parts = hostname.split(".");

  // If it's the main domain (villageorbit.in or example.com)
  // It will have only 2 parts (domain.tld) or 3 parts (subdomain.domain.tld)
//   if (parts.length <= 2) {
//     return null; // Main domain
//   }

  // Extract the subdomain (first part) if there are more than 2 parts
  // This assumes the structure: [subdomain].[domain].[tld]
  const subdomain = parts[0];
  // Validate that it's not a standard subdomain like "www", "api", etc.
  const standardSubdomains = ["www", "api", "admin", "mail", "ftp"];
  if (standardSubdomains.includes(subdomain.toLowerCase())) {
    return null; // These are not village subdomains
  }

  return subdomain.toLowerCase();
};

/**
 * Checks if the current domain is the main domain (not a subdomain)
 */
export const isMainDomain = (): boolean => {
  return getSubdomainSlug() === null;
};

/**
 * Converts a village slug to a subdomain URL
 * Example: "shivankhed-khurd" -> "http://shivankhed-khurd.villageorbit.in"
 */
export const getVillageSubdomainUrl = (villageSlug: string): string => {
  if (typeof window === "undefined") {
    return ""; // SSR safety
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Handle localhost development
  if (hostname === "localhost" || hostname.startsWith("127.")) {
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${protocol}//${villageSlug}.localhost${port}`;
  }

  // Extract main domain (domain.tld)
  const parts = hostname.split(".");
  const mainDomain = parts.slice(-2).join(".");

  return `${protocol}//${villageSlug}.${mainDomain}`;
};

/**
 * Gets the current village ID from subdomain slug
 * This should be called after fetching villages list
 */
export const getAllVillageSubdomainUrls = (
  villages: Array<{ id: string; name: string; slug?: string }>
): Record<string, string> => {
  return villages.reduce(
    (acc, village) => {
      const slug = village.slug || village.name.replace(/\s+/g, "-").toLowerCase();
      acc[village.id] = getVillageSubdomainUrl(slug);
      return acc;
    },
    {} as Record<string, string>
  );
};

/**
 * Creates slug from village name
 * Example: "Shivankhed Khurd" -> "shivankhed-khurd"
 */
export const createSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};
