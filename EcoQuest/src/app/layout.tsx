import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoQuest',
  description:
    'EcoQuest is a gamified green finance and personal budgeting platform with behavioral rules engine, missions, XP, and savings goals.',
  openGraph: {
    title: 'EcoQuest',
    description:
      'EcoQuest is a gamified green finance and personal budgeting platform with behavioral rules engine, missions, XP, and savings goals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcoQuest',
    description:
      'EcoQuest is a gamified green finance and personal budgeting platform with behavioral rules engine, missions, XP, and savings goals.',
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F4F7FC] text-[#0B1B3A] antialiased">
        {children}
      </body>
    </html>
  );
}
