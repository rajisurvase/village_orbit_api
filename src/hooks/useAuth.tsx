import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGramsevak, setIsGramsevak] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get existing session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserRoles(session.user.id);
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("🔐 Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserRoles(session.user.id);
        } else {
          setIsAdmin(false);
          setIsGramsevak(false);
          setIsSubAdmin(false);
          setIsApproved(false);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRoles = async (userId: string) => {
    try {
      console.log("🔍 Checking roles for user:", userId);
      
      // Check roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      console.log("📊 Roles data:", rolesData, "Error:", rolesError);
      
      const roles = rolesData?.map(r => r.role) || [];
      const hasAdmin = roles.includes("admin");
      const hasGramsevak = roles.includes("gramsevak");
      const hasSubAdmin = roles.includes("sub_admin");
      
      console.log("👤 User roles:", { hasAdmin, hasGramsevak, hasSubAdmin });
      
      setIsAdmin(hasAdmin);
      setIsGramsevak(hasGramsevak);
      setIsSubAdmin(hasSubAdmin);

      // Check approval status
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("id", userId)
        .maybeSingle();
      
      console.log("✅ Profile data:", profileData, "Error:", profileError);
      
      const approved = profileData?.approval_status === "approved";
      console.log("🎯 Is approved:", approved);
      
      setIsApproved(approved);
    } catch (error) {
      console.error("❌ Error checking user roles:", error);
      setIsAdmin(false);
      setIsGramsevak(false);
      setIsSubAdmin(false);
      setIsApproved(false);
    }
  };

  return { user, session, loading, isAdmin, isGramsevak, isSubAdmin, isApproved };
};
