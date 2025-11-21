import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Profile from '@/components/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-swapcircle-white">
        <Header />
        <Profile />
        <Footer />
      </main>
    </ProtectedRoute>
  );
}

