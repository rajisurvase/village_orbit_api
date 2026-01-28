/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */

import React from 'react';
import { useApiAuth } from '@/hooks/useApiAuth';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  fallback?: React.ReactNode;
  role?: string;
  roles?: string[];
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  role,
  roles = [],
}) => {
  const { hasPermission, hasAnyPermission, hasRole } = useApiAuth();

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    if (requireAll) {
      const hasAll = permissions.every(p => hasPermission(p));
      if (!hasAll) return <>{fallback}</>;
    } else {
      if (!hasAnyPermission(permissions)) return <>{fallback}</>;
    }
  }

  // Check single role
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (roles.length > 0) {
    const hasAnyRole = roles.some(r => hasRole(r));
    if (!hasAnyRole) return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Admin Guard - Only shows content for admin users
 */
export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isAdmin, isSuperAdmin } = useApiAuth();
  
  if (!isAdmin && !isSuperAdmin) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * Super Admin Guard - Only shows content for super admin users
 */
export const SuperAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isSuperAdmin } = useApiAuth();
  
  if (!isSuperAdmin) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * Approved User Guard - Only shows content for approved users
 */
export const ApprovedUserGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isApproved } = useApiAuth();
  
  if (!isApproved) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionGuard;
