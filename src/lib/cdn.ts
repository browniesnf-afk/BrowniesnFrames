const SUPABASE_STORAGE_URL = 'https://rapihhocsnmckogsmokp.supabase.co/storage/v1/object/public';

const CLOUDFLARE_CDN_URL = 'https://browniesnframes-cdn.browniesnf.workers.dev/storage/v1/object/public';

/**
 * Routes a Supabase storage image URL through the Cloudflare Worker CDN caching layer.
 * This saves database egress bandwidth and speeds up asset delivery.
 */
export function toCdnUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If it's a Supabase storage URL, rewrite it to go through the Cloudflare CDN proxy
  if (url.startsWith(SUPABASE_STORAGE_URL)) {
    return url.replace(SUPABASE_STORAGE_URL, CLOUDFLARE_CDN_URL);
  }
  
  return url;
}
