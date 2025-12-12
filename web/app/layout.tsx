import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PoE2 Build Coach',
  description: 'Educational companion for Path of Building 2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
