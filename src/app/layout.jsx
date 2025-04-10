import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Dash Admin - Development Agency',
  description: 'Admin dashboard for Dash development agency',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}