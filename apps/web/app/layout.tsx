import "./globals.css";

export const metadata = {
  title: "Meridian",
  description: "Your accounts, at a glance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
