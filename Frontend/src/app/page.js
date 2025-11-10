import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ListingsGrid from '@/components/ListingsGrid';
import ValueProposition from '@/components/ValueProposition';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdf2f8' }}>
      <Header />
      <HeroSection />
      <ListingsGrid />
      <ValueProposition />
      <Footer />
    </main>
  );
}
