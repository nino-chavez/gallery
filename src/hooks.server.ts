import type { Handle } from '@sveltejs/kit';

/**
 * Server hook to prevent trailing slash redirects when accessed through Vercel proxy
 *
 * The main site proxies requests like:
 *   ninochavez.co/photography → nino-chavez-gallery.vercel.app/photography
 *
 * Without this hook, SvelteKit would redirect /photography → /photography/
 * causing an infinite loop between the proxy and this app.
 *
 * This hook prevents that redirect by handling the base path correctly.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const url = new URL(event.request.url);

  // If the URL matches our base path exactly without trailing slash
  // and it's coming through the proxy (check for specific headers or just accept it)
  if (url.pathname === '/photography') {
    // Rewrite internally to /photography/ without redirecting the client
    url.pathname = '/photography/';
    event.url = url;
  }

  return resolve(event);
};
