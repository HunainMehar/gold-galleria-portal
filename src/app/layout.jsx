import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Gold Galleria',
  description: 'Admin dashboard for Gold Galleria',
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