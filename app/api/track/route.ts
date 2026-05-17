import { NextRequest } from "next/server";

/**
 * Audio proxy route.
 *
 * The Web Audio API's AnalyserNode can only read sample data from media
 * elements whose source either matches the page origin OR returns explicit
 * CORS headers. SoundHelix's CDN does not send `Access-Control-Allow-Origin`,
 * so we re-stream it through this same-origin endpoint with permissive
 * headers and forwarded `Range` requests so the browser can still seek.
 */

const ALLOWED_HOSTS = new Set([
  "commondatastorage.googleapis.com",
  "storage.googleapis.com",
  "www.kozco.com",
  "kozco.com",
  "www.soundhelix.com",
  "soundhelix.com",
]);

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src");
  if (!src) {
    return new Response("Missing 'src' query parameter", { status: 400 });
  }

  let upstream: URL;
  try {
    upstream = new URL(src);
  } catch {
    return new Response("Invalid 'src' URL", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(upstream.host)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const forwardHeaders: Record<string, string> = {
    // SoundHelix's CDN returns a Drupal error page when no UA / Accept is
    // sent. Mimic a normal browser request.
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
  };
  const range = req.headers.get("range");
  if (range) forwardHeaders["range"] = range;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream.toString(), {
      headers: forwardHeaders,
      cache: "no-store",
      redirect: "follow",
    });
  } catch (err) {
    return new Response(
      `Upstream fetch failed: ${(err as Error).message}`,
      { status: 502 },
    );
  }

  if (!upstreamRes.ok && upstreamRes.status !== 206) {
    return new Response(`Upstream ${upstreamRes.status}`, {
      status: upstreamRes.status >= 500 ? 502 : upstreamRes.status,
    });
  }

  const headers = new Headers();
  for (const k of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "last-modified",
    "etag",
  ]) {
    const v = upstreamRes.headers.get(k);
    if (v) headers.set(k, v);
  }
  if (!headers.has("content-type")) headers.set("content-type", "audio/mpeg");
  if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
  headers.set("access-control-allow-origin", "*");
  headers.set("cache-control", "public, max-age=3600");

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers,
  });
}
