import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Event Management System',
  description: 'Enterprise Event Management System for event organizers, concert promoters, and production houses, featuring end-to-end budgeting, talent and rider management, procurement, rundown cues, risk registry, and ERP logistics integration readiness.',
  openGraph: {
    title: 'Event Management System',
    description: 'Enterprise Event Management System for event organizers, concert promoters, and production houses, featuring end-to-end budgeting, talent and rider management, procurement, rundown cues, risk registry, and ERP logistics integration readiness.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Management System',
    description: 'Enterprise Event Management System for event organizers, concert promoters, and production houses, featuring end-to-end budgeting, talent and rider management, procurement, rundown cues, risk registry, and ERP logistics integration readiness.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
