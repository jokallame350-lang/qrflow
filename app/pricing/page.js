import Navbar from '@/components/landing/Navbar';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export const metadata = {
    title: "Pricing — QRFlow",
    description: "Simple, transparent pricing for QRFlow. Start free, upgrade when you need more.",
};

export default function PricingPage() {
    return (
        <main>
            <Navbar />
            <div className="pt-20">
                <Pricing />
            </div>
            <Footer />
        </main>
    );
}
