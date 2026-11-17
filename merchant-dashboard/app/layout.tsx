import "./globals.css";
import { Bricolage_Grotesque } from "next/font/google";
const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font" });
export const metadata = { title: "Merchant dashboard" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={font.variable}>{children}</body></html>;
}
