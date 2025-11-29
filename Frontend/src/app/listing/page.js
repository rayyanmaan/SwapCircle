import Footer from '@/components/Footer';
import ListingPage from '@/components/ListingPage';

/**
 * Listing Page Route
 * 
 * Next.js App Router page for displaying individual listing details.
 * 
 * TODO: Add dynamic routing support (e.g., /listing/[id])
 * TODO: Fetch listing data from backend API using route params
 * TODO: Handle loading states while fetching data
 * TODO: Handle error states (404, API errors)
 * TODO: Add metadata for SEO
 */
export default function ListingRoute() {
  return (
    <main className="min-h-screen bg-swapcircle-white">
      <ListingPage />
      <Footer />
    </main>
  );
}

