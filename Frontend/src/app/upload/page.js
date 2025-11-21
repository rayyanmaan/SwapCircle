import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UploadForm from '@/components/UploadForm';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-swapcircle-white">
        <Header />
        <UploadForm />
        <Footer />
      </main>
    </ProtectedRoute>
  );
}

