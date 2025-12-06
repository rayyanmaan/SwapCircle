import ListingCard from './ListingCard';

export default function ListingsGrid({ title = 'Latest Swaps', listings = [] }) {
  // Use provided listings (empty array if none provided)
  const displayListings = listings || [];
  
  return (
    <div className="max-w-7xl mx-auto">
      {title && (
        <h2 className="heading-primary text-3xl font-bold mb-8">{title}</h2>
      )}
      {displayListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-swapcircle-secondary">No listings available</p>
        </div>
      )}
    </div>
  );
}

