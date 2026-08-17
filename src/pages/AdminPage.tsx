import { useState, useEffect } from 'react';
import { Users, QrCode, ScanLine, Globe, TrendingUp, Activity, Clock, Shield, LogOut, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

const ADMIN_SECRET = 'qonnect-admin-2026';
const API = (path: string) => `/api/admin${path}`;

function adminFetch(path: string) {
  return fetch(API(path), {
    headers: { 'X-Admin-Secret': ADMIN_SECRET },
    credentials: 'include',
  }).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  users: { total: number; new_today: number; new_this_week: number };
  qr_codes: { total: number; active: number; inactive: number; url_type: number; file_type: number };
  scans: { total: number; today: number; this_week: number; this_month: number };
  domains: { verified: number };
}
interface AdminUser {
  id: number; email: string; name: string; avatar_url: string;
  drive_connected: boolean; qr_count: number; created_at: string;
}
interface AdminQR {
  id: number; short_code: string; title: string; type: string;
  is_active: boolean; scan_count: number; owner_email: string;
  destination_url?: string; created_at: string; public_url: string;
}
interface Scan {
  id: number; short_code: string; qr_title: string;
  country: string; device: string; browser: string; scanned_at: string;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
      ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
    }`}>{label}</span>
  );
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'users' | 'qrcodes' | 'scans'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [qrCodes, setQrCodes] = useState<AdminQR[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, u, q, sc] = await Promise.all([
        adminFetch('/stats'),
        adminFetch('/users'),
        adminFetch('/qr-codes'),
        adminFetch('/scans/recent'),
      ]);
      setStats(s);
      setUsers(u.users);
      setQrCodes(q.qr_codes);
      setScans(sc.scans);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sortField];
    const bv = (b as unknown as Record<string, unknown>)[sortField];
    const cmp = String(av) < String(bv) ? -1 : 1;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield size={40} className="mx-auto mb-3 text-red-400" />
          <p className="text-lg font-semibold text-slate-700">Access Denied</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button onClick={load} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <QrCode size={15} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800">Qonnect</span>
              <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-400">
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <a href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-sm transition-colors">
              <LogOut size={13} />
              Exit
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-200/60 p-1 rounded-xl w-fit">
          {(['overview', 'users', 'qrcodes', 'scans'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'qrcodes' ? 'QR Codes' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && stats && (
              <div className="space-y-8">
                {/* Stat grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.users.total}
                    sub={`+${stats.users.new_today} today`} icon={Users} color="bg-indigo-500" />
                  <StatCard label="QR Codes" value={stats.qr_codes.total}
                    sub={`${stats.qr_codes.active} active`} icon={QrCode} color="bg-violet-500" />
                  <StatCard label="Total Scans" value={stats.scans.total}
                    sub={`${stats.scans.today} today`} icon={ScanLine} color="bg-emerald-500" />
                  <StatCard label="Custom Domains" value={stats.domains.verified}
                    sub="verified" icon={Globe} color="bg-sky-500" />
                </div>

                {/* Secondary grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Scans breakdown */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={16} className="text-indigo-500" />
                      <h3 className="font-semibold text-slate-700 text-sm">Scan Activity</h3>
                    </div>
                    {[
                      { label: 'Today', value: stats.scans.today },
                      { label: 'This week', value: stats.scans.this_week },
                      { label: 'This month', value: stats.scans.this_month },
                      { label: 'All time', value: stats.scans.total },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-500">{label}</span>
                        <span className="font-semibold text-slate-800">{value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* QR breakdown */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode size={16} className="text-violet-500" />
                      <h3 className="font-semibold text-slate-700 text-sm">QR Breakdown</h3>
                    </div>
                    {[
                      { label: 'URL type', value: stats.qr_codes.url_type, color: 'bg-indigo-500' },
                      { label: 'File type', value: stats.qr_codes.file_type, color: 'bg-violet-500' },
                      { label: 'Active', value: stats.qr_codes.active, color: 'bg-emerald-500' },
                      { label: 'Inactive', value: stats.qr_codes.inactive, color: 'bg-slate-300' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-sm text-slate-500 flex-1">{label}</span>
                        <span className="font-semibold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* User growth */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity size={16} className="text-emerald-500" />
                      <h3 className="font-semibold text-slate-700 text-sm">User Growth</h3>
                    </div>
                    {[
                      { label: 'New today', value: stats.users.new_today },
                      { label: 'New this week', value: stats.users.new_this_week },
                      { label: 'Total users', value: stats.users.total },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-500">{label}</span>
                        <span className="font-semibold text-slate-800">{value}</span>
                      </div>
                    ))}

                    {/* Recent scans preview */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Scans</p>
                      {scans.slice(0, 3).map(s => (
                        <div key={s.id} className="flex items-center gap-2 mb-2">
                          <Clock size={11} className="text-slate-400 flex-shrink-0" />
                          <span className="text-xs text-slate-600 truncate flex-1">{s.qr_title}</span>
                          <span className="text-xs text-slate-400">{timeAgo(s.scanned_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">{users.length} Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {[
                          { label: 'User', field: 'email' },
                          { label: 'QR Codes', field: 'qr_count' },
                          { label: 'Drive', field: 'drive_connected' },
                          { label: 'Joined', field: 'created_at' },
                        ].map(({ label, field }) => (
                          <th
                            key={field}
                            onClick={() => toggleSort(field)}
                            className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                          >
                            <span className="flex items-center gap-1">{label} {sortIcon(field)}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map(u => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                                  {u.email[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-slate-800">{u.name || '—'}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700">{u.qr_count}</td>
                          <td className="px-5 py-3.5">
                            <Badge ok={u.drive_connected} label={u.drive_connected ? 'Connected' : 'Not connected'} />
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs">{timeAgo(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QR CODES */}
            {tab === 'qrcodes' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700">{qrCodes.length} QR Codes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Title</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Owner</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Type</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Scans</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Short code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qrCodes.map(qr => (
                        <tr key={qr.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800 max-w-[200px] truncate">{qr.title}</p>
                            {qr.destination_url && (
                              <p className="text-xs text-slate-400 truncate max-w-[200px]">{qr.destination_url}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">{qr.owner_email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              qr.type === 'url' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
                            }`}>{qr.type}</span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700">{qr.scan_count}</td>
                          <td className="px-5 py-3.5">
                            <Badge ok={qr.is_active} label={qr.is_active ? 'Active' : 'Disabled'} />
                          </td>
                          <td className="px-5 py-3.5">
                            <a href={qr.public_url} target="_blank" rel="noopener noreferrer"
                              className="font-mono text-xs text-indigo-600 hover:underline">
                              {qr.short_code}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SCANS */}
            {tab === 'scans' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700">Last {scans.length} Scan Events</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">QR</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Country</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Device</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Browser</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map(s => (
                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-medium text-slate-700 truncate max-w-[180px]">{s.qr_title}</p>
                            <p className="text-xs font-mono text-slate-400">{s.short_code}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-500">{s.country || '—'}</td>
                          <td className="px-5 py-3 text-slate-500 capitalize">{s.device || '—'}</td>
                          <td className="px-5 py-3 text-slate-500">{s.browser || '—'}</td>
                          <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{timeAgo(s.scanned_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {scans.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">No scans yet</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
