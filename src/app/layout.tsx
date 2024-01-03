import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css';
import { Providers } from '../lib/Providers';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chee Time Tracker',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <html lang="en">
      <body className={inter.className}>
        <div className="flex items-center justify-center min-h-screen pt-12 pb-24 dark">
          <div className="w-full max-w-5xl inner">
            <Providers>
            <Header />
              {children}
            </Providers>
            <Toaster
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#18181B',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#2D69F0',
                  secondary: '#fff',
                },
              }}
            />
          </div>
        </div>
      </body>
    </html>
  )
}
