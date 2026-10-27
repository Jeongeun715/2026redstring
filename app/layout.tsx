import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./mobile-layout.css";
const pretendard = localFont({ src: "./fonts/PretendardVariable.woff2", variable: "--font-pretendard", display: "swap", weight: "45 920" });

export const metadata: Metadata = { title: "Red String — 2026.12.20 연말 공연", description: "2026년 12월 20일 오후 6시, 합정 허밋. 레드스트링 첫 단독 공연.", robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body className={pretendard.variable}><div className="site-shell">{children}</div></body></html> }
