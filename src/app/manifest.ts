import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chee Time Tracker',
    short_name: 'Time Tracker',
    description: 'Track and manage your time entries',
    start_url: '/',
    display: 'standalone',
    background_color: '#18181B',
    theme_color: '#2496b9',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
