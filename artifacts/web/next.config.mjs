/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Replit and other cloud IDEs serve the dev preview from a proxied origin.
  // Without this, sections below the fold render blank with no console error
  // and the server log shows "Blocked cross-origin request" — a dev-only
  // setting, not a content bug.
  allowedDevOrigins: ["*.replit.dev", "*.repl.co", "*.janeway.replit.dev"],
};

export default nextConfig;
