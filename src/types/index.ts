// Core application types for Qonnect

export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  drive_connected: boolean;
  created_at: string;
}

export type QrType = 'url' | 'file';

export interface QrCode {
  id: number;
  short_code: string;
  type: QrType;
  title: string;
  is_active: boolean;
  public_url: string;
  scan_count: number;
  destination_url?: string;      // URL type
  original_filename?: string;    // File type
  mime_type?: string;            // File type
  file_size?: number;            // File type, bytes
  custom_domain?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomDomain {
  id: number;
  domain: string;
  verified: boolean;
  verification_method: string;
  verification_token: string;
  dns_record_name: string;
  dns_record_type: string;
  dns_record_value: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_scans: number;
  unique_approx: number;
  scans_today: number;
  scans_week: number;
  scans_month: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface CountryData {
  country: string;
  count: number;
}

export interface CityData {
  city: string;
  count: number;
}

export interface DeviceData {
  device: string;
  count: number;
}

export interface BrowserData {
  browser: string;
  count: number;
}

export interface OSData {
  os: string;
  count: number;
}

export interface Analytics {
  qr_id: number;
  period: string;
  summary: AnalyticsSummary;
  scans_over_time: TimeSeriesPoint[];
  by_country: CountryData[];
  by_city: CityData[];
  by_device: DeviceData[];
  by_browser: BrowserData[];
  by_os: OSData[];
}

export interface PaginatedQrCodes {
  qr_codes: QrCode[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ApiError {
  error: string;
}

export type SortOption = 'newest' | 'oldest' | 'most_scanned';
export type FilterType = 'all' | 'url' | 'file';
export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y' | 'all';
