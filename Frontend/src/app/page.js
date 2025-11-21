import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ListingsGrid from '@/components/ListingsGrid';
import ValueProposition from '@/components/ValueProposition';
import Footer from '@/components/Footer';
import GuestRoute from '@/components/GuestRoute';

// Featured products data
const featuredListings = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    size: 'Size M',
    credits: 2,
    condition: 'Gently Used',
    timestamp: '2h ago',
  },
  {
    id: 2,
    title: 'Cozy Knit Sweater',
    size: 'Size S',
    credits: 1,
    condition: 'Like New',
    timestamp: '4h ago',
  },
  {
    id: 3,
    title: 'Floral Summer Dress',
    size: 'Size M',
    credits: 2,
    condition: 'Like New',
    timestamp: '6h ago',
  },
  {
    id: 4,
    title: 'Classic White Sneakers',
    size: 'Size 8',
    credits: 1,
    condition: 'Good',
    timestamp: '1d ago',
  },
  {
    id: 5,
    title: 'Navy Blue Blazer',
    size: 'Size L',
    credits: 3,
    condition: 'Excellent',
    timestamp: '1d ago',
  },
  {
    id: 6,
    title: 'Red Leather Backpack',
    size: 'One Size',
    credits: 5,
    condition: 'Like New',
    timestamp: '2d ago',
  },
  {
    id: 7,
    title: 'Striped Button Down Shirt',
    size: 'Size M',
    credits: 1,
    condition: 'Gently Used',
    timestamp: '2d ago',
  },
  {
    id: 8,
    title: 'Athletic Leggings',
    size: 'Size S',
    credits: 2,
    condition: 'Excellent',
    timestamp: '3d ago',
  },
];

export default function Home() {
  return (
    <GuestRoute>
      <main className="min-h-screen bg-swapcircle-white">
        <Header />
        <HeroSection />
        
        {/* Featured Products Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-swapcircle-alt">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-primary text-3xl md:text-4xl font-bold mb-4">
                Featured Items
              </h2>
              <p className="text-swapcircle-secondary text-lg max-w-2xl mx-auto">
                Discover the most popular items from your campus community
              </p>
            </div>
            <ListingsGrid title="" listings={featuredListings} />
          </div>
        </section>

        <ValueProposition />
        <Footer />
      </main>
    </GuestRoute>
  );
}
