import "./globals.css";

export const metadata = {
  title: "Meridian Admin",
  description: "Internal operations console.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
