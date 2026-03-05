import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://vast-planck.vercel.app'),
  title: {
    default: "QRFlow | Create & Track Dynamic QR Codes instantly",
    template: "%s | QRFlow"
  },
  description: "Create, customize, and track dynamic QR codes with powerful analytics. Change link destinations anytime without reprinting. Built for modern creators and businesses. Start for free.",
  keywords: [
    "QR code generator", "dynamic QR code", "QR analytics", "QR code management",
    "custom QR code", "marketing QR", "trackable QR", "QR code branding"
  ],
  authors: [{ name: 'QRFlow' }],
  creator: 'QRFlow Team',
  publisher: 'QRFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'QRFlow | Dynamic QR Code Management',
    description: 'Create, customize, and track dynamic QR codes with powerful analytics. Change destinations anytime without reprinting.',
    url: 'https://vast-planck.vercel.app',
    siteName: 'QRFlow',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QRFlow | Professional QR Code Generator',
    description: 'Track dynamic QR codes with powerful analytics. Change your link destination anytime without reprinting.',
    creator: '@qrflow',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
