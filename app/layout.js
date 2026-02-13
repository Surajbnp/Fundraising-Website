import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { ChakraProvider } from "@chakra-ui/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Help Sarika",
  description: "help her to fight with cancer",
  openGraph: {
    title: "Help Sarika",
    description: "Help her to fight with cancer",
    url: "https://savesarika.online",
    siteName: "Help Sarika",
    images: [
      {
        url: "https://res.cloudinary.com/dddnxiqpq/image/upload/v1770964663/d1a55dbd-a1db-498e-ab39-fa5c5a1d31ee.webp", // 👈 your preview image
        width: 1200,
        height: 630,
        alt: "Help Sarika",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Sarika",
    description: "Help her to fight with cancer",
    images: ["https://res.cloudinary.com/dddnxiqpq/image/upload/v1770964663/d1a55dbd-a1db-498e-ab39-fa5c5a1d31ee.webp"],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable}`}
      >
        <ChakraProvider>{children}</ChakraProvider>
      </body>
    </html>
  );
}
