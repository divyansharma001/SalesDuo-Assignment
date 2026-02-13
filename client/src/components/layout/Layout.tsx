import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <div className="hero-gradient flex-1 flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
