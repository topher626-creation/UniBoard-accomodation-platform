import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { FaInstagram, FaFacebookF, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa6";
import { BrandLogo } from "../BrandLogo";

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="ub-footer py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          {/* About */}
          <div className="col-lg-4">
            <div className="mb-3">
              <BrandLogo height={56} />
            </div>
            <p className="text-muted small mb-2" style={{ lineHeight: "1.7" }}>
              Your trusted platform for finding verified student accommodation near campus.
              We connect students with verified landlords and agents.
            </p>
            <p className="text-muted small mb-4" style={{ lineHeight: "1.6", opacity: 0.9 }}>
              Founded by <strong className="text-primary fw-bold">Siame Christopher</strong> – Crafting Zambia's premier student housing platform ✨
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-muted ub-social-link" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-muted ub-social-link" aria-label="Facebook">
                <FaFacebookF size={18} />
              </a>
              <a href="https://www.tiktok.com/@uniboardzambia" target="_blank" rel="noopener noreferrer" className="text-muted ub-social-link" aria-label="TikTok">
                <FaTiktok size={18} />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-muted ub-social-link" aria-label="X (Twitter)">
                <FaTwitter size={18} />
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="text-muted ub-social-link" aria-label="YouTube">
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none small ub-footer-link">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none small ub-footer-link">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/help" className="text-muted text-decoration-none small ub-footer-link">
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none small ub-footer-link">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-3">For Providers</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none small ub-footer-link">
                  List Property
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/landlord" className="text-muted text-decoration-none small ub-footer-link">
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none small ub-footer-link">
                  Pricing
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none small ub-footer-link">
                  Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">Contact Us</h6>
            <ul className="list-unstyled text-muted small">
              <li className="mb-2 d-flex align-items-center gap-2">
                <MessageCircle size={16} className="flex-shrink-0" aria-hidden />
                <a href="https://wa.me/+260976449402" target="_blank" rel="noopener noreferrer" className="text-decoration-none">WhatsApp: +260 976 449 402</a>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <Phone size={16} className="flex-shrink-0" aria-hidden />
                Phone: +260 764 388 122
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <Mail size={16} className="flex-shrink-0" aria-hidden />
                Email: contact@uniboard.com
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <p className="text-muted small mb-0 text-center text-md-start">
            © {currentYear} UniBoard. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted small text-decoration-none ub-footer-link">
              Privacy Policy
            </a>
            <a href="#" className="text-muted small text-decoration-none ub-footer-link">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

