import React from 'react';
import './globals.css';

export const metadata = { title: 'Buyer Leads' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: 20, fontFamily: 'Inter, sans-serif' }}>
          <h1>Buyer Leads (Demo)</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
