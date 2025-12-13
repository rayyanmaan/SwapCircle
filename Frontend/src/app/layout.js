import { EB_Garamond } from 'next/font/google';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-garamond',
});
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Header from "../components/Header";
import NotificationContainer from "../components/NotificationContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "SwapCircle - College Student Clothes Swap Platform",
  description: "Swap your clothes with other college students. Buy for less, pay no seller fees, keep fashion circular.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={ebGaramond.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <Header />
            {children}
            <NotificationContainer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
