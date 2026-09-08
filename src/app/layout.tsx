import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'CareerOS | AI Internship & Job Application Assistant',
  description: 'AI-powered career operating system that extracts verified resume profiles, matches eligibility against job postings, asks for missing information, and prepares accurate applications with human verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: '1 0 auto', paddingBottom: '3rem' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
