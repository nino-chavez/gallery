/**
 * Download Proxy API Route
 *
 * Proxies image downloads from SmugMug to avoid CORS issues.
 * This endpoint fetches images from SmugMug server-side and serves them to the client.
 *
 * Usage: GET /api/download/[imageKey]?url=[smugmugUrl]&filename=[filename]
 */

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Get parameters from query string
    const imageUrl = url.searchParams.get('url');
    const filename = url.searchParams.get('filename') || 'download.jpg';

    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Validate URL is from SmugMug
    if (!imageUrl.includes('smugmug.com')) {
      return new Response('Invalid URL - must be from SmugMug', { status: 400 });
    }

    console.log('[Download Proxy] Fetching:', imageUrl);

    // Fetch the image from SmugMug with proper headers
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'image',
        'sec-fetch-mode': 'no-cors',
        'sec-fetch-site': 'cross-site',
      },
    });

    if (!response.ok) {
      console.error('[Download Proxy] SmugMug responded with:', response.status, response.statusText);
      return new Response(`Failed to fetch image: ${response.status} ${response.statusText}`, { status: response.status });
    }

    // Get the image data
    const imageBlob = await response.blob();

    console.log('[Download Proxy] Successfully fetched image, size:', imageBlob.size, 'bytes');

    // Return the image with proper headers for download
    return new Response(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Content-Length': imageBlob.size.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('[Download Proxy] Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};