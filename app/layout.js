import "./globals.css";

export const metadata = {
  title: "QRFlow — Dynamic QR Code Management Platform",
  description: "Create, customize, and track dynamic QR codes with powerful analytics. Change destinations anytime without reprinting. Start free today.",
  keywords: "QR code, dynamic QR, QR analytics, QR generator, QR management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-grid">
        {children}
      </body>
    </html>
  );
}
