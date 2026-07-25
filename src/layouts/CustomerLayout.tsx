import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { SplashScreen } from '../components/ui/SplashScreen';

const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SplashScreen />
      <Navbar />
      <main className="flex-grow">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
