import "./globals.css";

export const metadata = {
  title: "NPB Pickle",
  description: "A daily mystery-player guessing game built around NPB players.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
