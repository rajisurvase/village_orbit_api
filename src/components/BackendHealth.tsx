/**
 * Backend Health Status Component
 * Displays the health status of the backend API
 * Optimized with memoization and stable callbacks
 */

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { healthService, HealthStatus } from '@/services/healthService';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BackendHealthProps {
  showDetails?: boolean;
  refreshInterval?: number; // in milliseconds, 0 to disable
}

const StatusIcon = memo<{ status: string | null; loading: boolean; error: boolean }>(
  ({ status, loading, error }) => {
    if (loading) return <Activity className="h-4 w-4 animate-pulse" />;
    if (error) return <XCircle className="h-4 w-4 text-destructive" />;
    
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  }
);

StatusIcon.displayName = 'StatusIcon';

const StatusBadge = memo<{ status: string | null; loading: boolean; error: boolean }>(
  ({ status, loading, error }) => {
    if (loading) {
      return <Badge variant="secondary">Checking...</Badge>;
    }
    if (error) {
      return <Badge variant="destructive">Offline</Badge>;
    }
    
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Degraded</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  }
);

StatusBadge.displayName = 'StatusBadge';

export const BackendHealth: React.FC<BackendHealthProps> = memo(({
  showDetails = false,
  refreshInterval = 60000, // 1 minute default
}) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await healthService.getHealth(true);
      if (response.success && response.data) {
        setHealth(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch health status');
        setHealth(null);
      }
    } catch (err) {
      setError('Failed to connect to backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchHealth]);

  const statusProps = useMemo(() => ({
    status: health?.status ?? null,
    loading,
    error: !!error,
  }), [health?.status, loading, error]);

  return (
    <div className="flex items-center gap-2">
      <StatusIcon {...statusProps} />
      <span className="text-sm font-medium">Backend:</span>
      <StatusBadge {...statusProps} />
      
      {showDetails && health && (
        <div className="ml-4 text-xs text-muted-foreground">
          {health.version && <span className="mr-2">v{health.version}</span>}
          {health.message && <span>{health.message}</span>}
        </div>
      )}
      
      {showDetails && error && (
        <span className="ml-4 text-xs text-destructive">{error}</span>
      )}
    </div>
  );
});

BackendHealth.displayName = 'BackendHealth';

export default BackendHealth;
