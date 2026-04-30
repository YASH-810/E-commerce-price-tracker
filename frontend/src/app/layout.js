// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

// Vercel-safe Google Font setup
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // avoids optimizeCss and lightningcss usage
});

export const metadata = {
  title: 'PriceHawk — E-commerce Price Tracker',
  description: 'Monitor product prices, visualize trends, and get alerts when prices drop to your target.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} noise`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'oklch(0.19 0.015 265 / 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid oklch(1 0 0 / 0.08)',
              color: 'oklch(0.96 0.005 265)',
            },
          }}
        />
      </body>
    </html>
  );
}
