import Footer from '@/components/Footer';
import Settings from '@/components/Settings';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-swapcircle-white">
        <Settings />
        <Footer />
      </main>
    </ProtectedRoute>
  );
}

