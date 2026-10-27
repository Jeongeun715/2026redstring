import type { Metadata } from "next";
import localFont from "next/font/local";
import { shareInfo } from "./data/share";
import "./globals.css";
import "./mobile-layout.css";
const pretendard = localFont({ src: "./fonts/PretendardVariable.woff2", variable: "--font-pretendard", display: "swap", weight: "45 920" });

export const metadata: Metadata = {
  metadataBase: new URL(shareInfo.siteUrl),
  title: shareInfo.title,
  description: shareInfo.description,
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "Red String",
    title: shareInfo.title,
    description: shareInfo.description,
  },
  twitter: { card: "summary_large_image", title: shareInfo.title, description: shareInfo.description },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body className={pretendard.variable}><div className="site-shell">{children}</div></body></html> }
