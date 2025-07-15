import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const pwaConfig = {
  dest: "public",
};

export default withPWA(pwaConfig)(nextConfig);
