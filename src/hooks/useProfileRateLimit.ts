import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitInfo {
  allowed: boolean;
  daily_count: number;
  daily_limit: number;
  hourly_count: number;
  hourly_limit: number;
  daily_remaining: number;
}

interface LogProfileViewResult {
  success: boolean;
  error?: string;
  rate_info?: RateLimitInfo;
}

interface SuspiciousActivityResult {
  suspicious: boolean;
  reason?: string;
}

interface UseProfileRateLimitReturn {
  rateInfo: RateLimitInfo | null;
  isLoading: boolean;
  logProfileView: (candidateId: string, viewType: 'preview' | 'full' | 'unlock', viewerRole?: string) => Promise<{ success: boolean; error?: string }>;
  checkRateLimit: () => Promise<RateLimitInfo | null>;
}

export function useProfileRateLimit(): UseProfileRateLimitReturn {
  const [rateInfo, setRateInfo] = useState<RateLimitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkRateLimit = useCallback(async (): Promise<RateLimitInfo | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('check_profile_view_rate_limit', {
        p_viewer_id: user.id,
        p_daily_limit: 50
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return null;
      }

      const rateLimitData = data as unknown as RateLimitInfo;
      setRateInfo(rateLimitData);
      return rateLimitData;
    } catch (err) {
      console.error('Rate limit check failed:', err);
      return null;
    }
  }, []);

  const logProfileView = useCallback(async (
    candidateId: string,
    viewType: 'preview' | 'full' | 'unlock',
    viewerRole?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: true }; // Anonymous users aren't rate limited
      }

      const { data, error } = await supabase.rpc('log_profile_view', {
        p_viewer_id: user.id,
        p_candidate_id: candidateId,
        p_view_type: viewType,
        p_viewer_role: viewerRole || null
      });

      if (error) {
        console.error('Log profile view error:', error);
        return { success: false, error: error.message };
      }

      const result = data as unknown as LogProfileViewResult;

      if (result && !result.success) {
        if (result.rate_info) {
          setRateInfo(result.rate_info);
        }
        return { success: false, error: result.error };
      }

      if (result?.rate_info) {
        setRateInfo(result.rate_info);
      }

      // Check for suspicious activity in background
      supabase.rpc('detect_suspicious_profile_access', { p_viewer_id: user.id })
        .then(({ data: suspiciousData }) => {
          const suspicious = suspiciousData as unknown as SuspiciousActivityResult;
          if (suspicious?.suspicious) {
            console.warn('Suspicious activity detected:', suspicious.reason);
          }
        });

      return { success: true };
    } catch (err: any) {
      console.error('Log profile view failed:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rateInfo,
    isLoading,
    logProfileView,
    checkRateLimit,
  };
}
