import { createClient } from '@/utils/supabase/client';
import { AuditLogItem, AuditLogStats } from '@/types';

export async function recordAuditLog(payload: {
  action: string;
  path?: string;
  method?: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  details?: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      user_email: user?.email || null,
      action: payload.action,
      ip_address: payload.ip_address || '127.0.0.1',
      user_agent: payload.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      location: payload.location || 'Localhost / Dev',
      path: payload.path || '/',
      method: payload.method || 'GET',
      details: payload.details || {}
    });

    if (error) {
      console.warn('Audit log insert warning:', error.message);
      return false;
    }
    return true;
  } catch (err: unknown) {
    console.error('Error recording audit log:', err);
    return false;
  }
}

export async function fetchAuditLogs(options?: {
  page?: number;
  limit?: number;
  search?: string;
  actionFilter?: string;
}): Promise<AuditLogItem[]> {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createClient();
    let query = supabase
      .from('audit_logs')
      .select('*, user:profiles!user_id(*)')
      .order('created_at', { ascending: false });

    if (options?.actionFilter && options.actionFilter !== 'all') {
      query = query.eq('action', options.actionFilter);
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`ip_address.ilike.${term},action.ilike.${term},path.ilike.${term},user_email.ilike.${term}`);
    }

    query = query.range(from, to);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as AuditLogItem[];
  } catch (err: unknown) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
}

export async function fetchAuditLogStats(): Promise<AuditLogStats> {
  try {
    const supabase = createClient();
    const todayISO = new Date().toISOString().split('T')[0];

    const [{ count: totalLogs }, { count: todayLogs }, { data: ipData }] = await Promise.all([
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('audit_logs').select('ip_address').not('ip_address', 'is', null)
    ]);

    const uniqueIps = new Set(ipData?.map((item) => item.ip_address).filter(Boolean)).size;

    const { count: adminActions } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .or('action.ilike.%ADMIN%,action.ilike.%UPDATE_ROLE%,action.ilike.%BROADCAST%');

    return {
      total_logs: totalLogs || 0,
      today_logs: todayLogs || 0,
      unique_ips: uniqueIps || 0,
      admin_actions: adminActions || 0,
      top_browser: 'Real Users'
    };
  } catch (err: unknown) {
    console.error('Error fetching audit log stats:', err);
    return {
      total_logs: 0,
      today_logs: 0,
      unique_ips: 0,
      admin_actions: 0,
      top_browser: '-'
    };
  }
}
