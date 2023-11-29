import { Inter } from 'next/font/google';
import './globals.css';
import Index from '../components/Index';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Lockstash',
  description: '',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Index>{children}</Index>
      </body>
    </html>
  );
}
