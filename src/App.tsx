import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Work from './pages/Work'
import Offers from './pages/Offers'
import Contact from './pages/Contact'
import Desk from './pages/Desk'
import AlignmentGuide from './pages/AlignmentGuide'
import AiTwin from './pages/AiTwin'
import SoftBoundaries from './pages/SoftBoundaries'
import SoftPowerReset from './pages/SoftPowerReset'
import SoftStrategyDesk from './pages/SoftStrategyDesk'
import AdminDashboard from './pages/Admin'
import ServicePage from './pages/ServicePage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutCancel from './pages/CheckoutCancel'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function Layout({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  return (
    <>
      {showNav && <Navbar />}
      {children}
      {showNav && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Marketing site */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/work" element={<Layout><Work /></Layout>} />
        <Route path="/offers" element={<Layout><Offers /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/alignment-guide" element={<Layout><AlignmentGuide /></Layout>} />
        <Route path="/ai-twin" element={<Layout><AiTwin /></Layout>} />
        <Route path="/soft-boundaries" element={<Layout><SoftBoundaries /></Layout>} />
        <Route path="/soft-power-reset" element={<Layout><SoftPowerReset /></Layout>} />
        <Route path="/soft-strategy-desk" element={<Layout><SoftStrategyDesk /></Layout>} />
        <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/terms-of-use" element={<Layout><TermsOfUse /></Layout>} />

        {/* Post-checkout */}
        <Route path="/checkout/success" element={<Layout><CheckoutSuccess /></Layout>} />
        <Route path="/checkout/cancel" element={<Layout><CheckoutCancel /></Layout>} />

        {/* Flagship app — no nav/footer, immersive */}
        <Route path="/desk" element={<Layout showNav={false}><Desk /></Layout>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Dynamic service pages (admin-created) */}
        <Route path="/services/:slug" element={<Layout><ServicePage /></Layout>} />

        {/* Fallback */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 text-center pt-24">
      <div>
        <p className="font-mono text-[13px] tracking-widest text-ink-dim uppercase mb-4">404</p>
        <h1 className="font-serif text-4xl font-light text-ink mb-4">Page not found.</h1>
        <a href="/" className="font-sans text-sm text-lavender hover:text-lavender-light transition-colors underline underline-offset-4">
          Return home →
        </a>
      </div>
    </div>
  )
}
