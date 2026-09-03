import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ChatbotWidget from "@/components/ChatbotWidget";

const sourceSans = Source_Sans_3({
  variable: "--font-gov-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-gov-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillMitra | Maharashtra Job Intelligence",
  description:
    "SkillMitra connects job-market intelligence, employer requirements, skill gaps, courses, training capacity and placement outcomes to support evidence-based skill development planning across Maharashtra.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f4f7fa] text-[#1b2838]">
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
          <ChatbotWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
