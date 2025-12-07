import Footer from '@/components/Footer';
import Profile from '@/components/Profile';

export default async function UserProfilePage({ params }) {
  const { username } = await params;
  
  return (
    <main className="min-h-screen bg-swapcircle-white">
      <Profile username={username} />
      <Footer />
    </main>
  );
}

