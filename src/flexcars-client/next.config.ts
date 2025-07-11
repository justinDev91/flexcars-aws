import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  async headers() {
    // Configuration dynamique pour développement vs production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Extraire le domaine du backend pour la CSP
    const backendDomain = backendUrl.replace(/^https?:\/\//, '');
    const connectSrcUrls = [
      "'self'",
      isDevelopment ? 'http://localhost:3001' : `https://${backendDomain}`,
      isDevelopment ? 'ws://localhost:3001' : '', // WebSocket pour le développement
      'https://api.stripe.com',
      'https://m.stripe.com',
      'https://r.stripe.com',
      'https://q.stripe.com',
      'https://www.google-analytics.com',
      'https://connect.facebook.net'
    ].filter(Boolean); // Supprimer les chaînes vides

    return [
      {
        source: '/(.*)',
        headers: [
          // Politique de sécurité du contenu (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.com https://r.stripe.com https://q.stripe.com https://www.googletagmanager.com https://connect.facebook.net https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.pexels.com https://picsum.photos https://loremflickr.com https://images.unsplash.com https://www.facebook.com",
              `connect-src ${connectSrcUrls.join(' ')} https://accounts.google.com`,
              "frame-src 'self' https://js.stripe.com https://m.stripe.com https://r.stripe.com https://q.stripe.com https://www.facebook.com https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://accounts.google.com",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          // Protection contre le clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Protection contre le MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Protection contre les attaques XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Politique des référents
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Transport Security HTTP Strict (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Politique de permissions
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=(self)',
              'accelerometer=()',
              'gyroscope=()',
              'magnetometer=()',
              'payment=(self)'
            ].join(', ')
          }
        ],
      },
    ];
  },
};

export default nextConfig;
