import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer py-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          {/* About */}
          <div className="col-lg-4">
            <h5 className="fw-bold mb-3">
              <span className="text-primary">🏠 UniBoard</span>
            </h5>
            <p className="text-muted small mb-3">
              Your trusted platform for finding verified student accommodation near campus.
              We connect students with verified landlords and agents.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-twitter-x fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-tiktok fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-youtube fs-5"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none small">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none small">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/help" className="text-muted text-decoration-none small">
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none small">
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
                <Link to="/register" className="text-muted text-decoration-none small">
                  List Property
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/landlord" className="text-muted text-decoration-none small">
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none small">
                  Pricing
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none small">
                  Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">Contact Us</h6>
            <ul className="list-unstyled text-muted small">
              <li className="mb-2">
                📱 WhatsApp: +260 976 449 402
              </li>
              <li className="mb-2">
                📞 Phone: +260 764 388 122
              </li>
              <li className="mb-2">
                ✉️ Email: contact@uniboard.com
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <p className="text-muted small mb-0">
            © {currentYear} UniBoard. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted small text-decoration-none">
              Privacy Policy
            </a>
            <a href="#" className="text-muted small text-decoration-none">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
