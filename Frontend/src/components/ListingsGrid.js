import ListingCard from './ListingCard';

// Sample data - in a real app, this would come from props or API
const sampleListings = [
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

export default function ListingsGrid({ title = 'Latest Swaps', listings = sampleListings }) {
  // Use sample listings if empty array is passed
  const displayListings = listings.length > 0 ? listings : sampleListings;
  
  return (
    <div className="max-w-7xl mx-auto">
      {title && (
        <h2 className="heading-primary text-3xl font-bold mb-8">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayListings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </div>
  );
}

