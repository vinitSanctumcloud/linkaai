// app/layout.tsx
"use client"; // Add this directive at the top

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Provider } from 'react-redux';
import store from '@/store';

const inter = Inter({ subsets: ['latin'] });

// const metadata: Metadata = {
//   title: 'Linka.ai - AI Agents for Creators & Brands',
//   description:
//     'Create intelligent AI agents that engage your audience and drive revenue. Perfect for creators, brands, hotels, and businesses of all sizes.',
//   keywords: 'AI agents, creators, brands, hotels, affiliate marketing, chatbots, revenue, business automation',
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}