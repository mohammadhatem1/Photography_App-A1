import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Gallery from "./components/Gallery.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import OrderSuccess from "./components/OrderSuccess.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { authOpen, closeAuth } = useAuth();

  // Stripe sends the customer back to /?order=ID (paid flow) or /?canceled=1
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order");
  const canceled = params.get("canceled");

  return (
    <>
      <Header />
      <main id="top">
        {orderId ? (
          <OrderSuccess orderId={orderId} />
        ) : (
          <>
            {canceled && (
              <p role="status" className="bg-tint px-5 py-3 text-center">
                Checkout canceled. You haven't been charged.
              </p>
            )}
            <Hero />
            <Gallery />
            <About />
            <Contact />
            <Footer />
          </>
        )}
      </main>
      
      {authOpen && <AuthModal onClose={closeAuth} />}
    </>
  );
}