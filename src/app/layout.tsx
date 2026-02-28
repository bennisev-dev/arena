import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import '@/app/globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora'
});

export const metadata: Metadata = {
  title: 'Arena',
  description: 'Arena dealership leaderboard system'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
