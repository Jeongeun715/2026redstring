import type { Metadata } from "next";
import "./globals.css";
import "./mobile-layout.css";
export const metadata: Metadata = { title: "Red String — 2026.12.20 연말 공연", description: "2026년 12월 20일 오후 6시, 합정 허밋. 레드스트링 첫 단독 공연.", robots: { index: false, follow: false }, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body><div className="site-shell">{children}</div></body></html> }
