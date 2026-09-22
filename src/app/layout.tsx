import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { getCurrentProfile } from "@/lib/current-user";
import "./globals.css";

// Headings and big numbers, per docs/build-brief.md section 8.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Body text and UI, per docs/build-brief.md section 8.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Love and Light Healings",
  description: "A daily wellness tracker: water, steps, sleep, food, recipes, routines and more.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#FAF7FD",
  width: "device-width",
  initialScale: 1,
};

/**
 * The signed-in user's chosen theme, or "default" for signed-out visitors.
 * Uses the shared, request-cached getCurrentProfile() so this doesn't cost
 * its own round trip when the page below also needs the profile.
 */
async function currentTheme(): Promise<string> {
  try {
    const profile = await getCurrentProfile();
    return profile?.theme ?? "default";
  } catch {
    return "default";
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await currentTheme();

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${instrumentSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
