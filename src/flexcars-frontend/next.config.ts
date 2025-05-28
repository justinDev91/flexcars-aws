import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: 
    [
      new URL('https://gravatar.com/avatar/99385b59329a92c7cc3007222e000326?s=400&d=robohash&r=x'),
      new URL('https://gravatar.com/avatar/b32b9575a3bafd78d99ccbbe4848b378?s=400&d=robohash&r=x')
    ],
  },
};

export default nextConfig;
