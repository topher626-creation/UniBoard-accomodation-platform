import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";

function About() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="bg-primary text-white py-5">
        <div className="container text-center">
          <div className="d-flex justify-content-center mb-4">
            <div className="bg-white rounded-3 p-3 shadow-sm">
              <BrandLogo height={56} to="/" />
            </div>
          </div>
          <h1 className="display-4 fw-bold mb-3">About UniBoard</h1>
          <p className="lead opacity-75 mb-2">
            Verified student accommodation in Zambia—built for safety, clarity, and trust.
          </p>
          <p className="small opacity-75 mb-0">
            Founded by <strong>Siame Christopher</strong> (sole founder). UniBoard is developed
            independently, with ideas from a small team; product direction and build are led by the
            founder.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="container py-4">
        <ul className="nav nav-pills mb-4 justify-content-center gap-2">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "how" ? "active" : ""}`}
              onClick={() => setActiveTab("how")}
            >
              How it Works
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "services" ? "active" : ""}`}
              onClick={() => setActiveTab("services")}
            >
              Services
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "help" ? "active" : ""}`}
              onClick={() => setActiveTab("help")}
            >
              Help Center
            </button>
          </li>
        </ul>

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="row g-4">
            <div className="col-lg-8 mx-auto">
              <h2 className="fw-bold mb-3">Why UniBoard exists</h2>
              <p className="lead text-muted mb-4">
                Many university and college students—especially first-years—struggle to find{" "}
                <strong>verified, safe, and affordable</strong> off-campus housing in Zambia.
                Scams, thin information, and unreliable listings make an already stressful move
                harder. UniBoard exists to fix that with a <strong>verification-first</strong>{" "}
                approach.
              </p>

              <h2 className="fw-bold mb-3">Who it is for</h2>
              <ul className="text-muted mb-4">
                <li className="mb-2">Students at universities and colleges</li>
                <li className="mb-2">Landlords who are approved after admin verification</li>
                <li className="mb-2">
                  Initial focus on key institutions in Zambia—designed to scale nationwide and,
                  over time, to other regions where the same trust model applies
                </li>
              </ul>

              <h2 className="fw-bold mb-3">What makes UniBoard different</h2>
              <ul className="text-muted mb-4">
                <li className="mb-2">
                  <strong>Verified landlords only</strong>—accounts are approved before they can
                  post; listings can be reviewed for quality and safety
                </li>
                <li className="mb-2">
                  <strong>Anti-scam by design</strong>—admin verification and controlled listings,
                  not an open directory
                </li>
                <li className="mb-2">
                  <strong>Student accommodation, not generic rentals</strong>—purpose-built for
                  campus-adjacent housing and how students search
                </li>
                <li className="mb-2">
                  <strong>Simple, friendly UX</strong>—for first-years and local students alike
                </li>
              </ul>

              <h2 className="fw-bold mb-3">Listings and content</h2>
              <p className="text-muted mb-4">
                <strong>Landlords own</strong> their listing content and images.{" "}
                <strong>UniBoard</strong> has the right to display and manage that content to
                operate the service, and to <strong>moderate, approve, or remove</strong> material
                that breaks platform rules—similar to trusted marketplace platforms you already use.
              </p>

              <h2 className="fw-bold mb-4">Security and peace of mind</h2>
              <p className="lead text-muted mb-4">
                We prioritize student safety: verified providers, structured checks, and a
                controlled listing environment so you can focus on your studies—not on guessing
                whether a post is legitimate.
              </p>

              <p className="text-muted small border-start border-primary border-3 ps-3 mb-0">
                <strong>Vision:</strong> UniBoard is building toward a trusted student accommodation
                network—starting in Zambia, expanding as verification and partnerships allow—so
                learners everywhere can find safe, transparent housing with confidence.
              </p>
            </div>
          </div>
        )}

        {/* How it Works Tab */}
        {activeTab === "how" && (
          <div className="row g-4">
            <div className="col-lg-10 mx-auto">
              <h2 className="fw-bold text-center mb-5">Simple, fast, reliable</h2>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card h-100 p-4">
                    <div className="mb-3">
                      <span className="badge bg-primary rounded-circle p-3">1</span>
                    </div>
                    <h4 className="fw-bold">Search for Accommodation</h4>
                    <p className="text-muted">
                      Use filters like location, price range, and bedspace type to quickly
                      find options that match your needs.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 p-4">
                    <div className="mb-3">
                      <span className="badge bg-primary rounded-circle p-3">2</span>
                    </div>
                    <h4 className="fw-bold">Explore Listings</h4>
                    <p className="text-muted">
                      Browse verified properties with clear details on pricing,
                      availability, and location to make informed decisions.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 p-4">
                    <div className="mb-3">
                      <span className="badge bg-primary rounded-circle p-3">3</span>
                    </div>
                    <h4 className="fw-bold">Connect with Providers</h4>
                    <p className="text-muted">
                      Reach out directly to landlords or agents through phone or
                      WhatsApp for quick responses and arrangements.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 p-4">
                    <div className="mb-3">
                      <span className="badge bg-primary rounded-circle p-3">4</span>
                    </div>
                    <h4 className="fw-bold">Secure Your Stay</h4>
                    <p className="text-muted">
                      Confirm your preferred bedspace and move forward with confidence,
                      knowing the listing meets quality standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="row g-4">
            <div className="col-lg-10 mx-auto">
              <h2 className="fw-bold text-center mb-5">Designed for students and property providers</h2>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card h-100 p-4 border-primary">
                    <h4 className="fw-bold mb-3">For students</h4>
                    <ul className="list-unstyled">
                      <li className="mb-2">Easy search for verified bedspaces</li>
                      <li className="mb-2">Smart filters for faster decisions</li>
                      <li className="mb-2">Direct communication with providers</li>
                      <li className="mb-2">Reliable and safe accommodation options</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 p-4 border-success">
                    <h4 className="fw-bold mb-3">For verified landlords</h4>
                    <ul className="list-unstyled">
                      <li className="mb-2">Apply for an account; post only after admin approval</li>
                      <li className="mb-2">List and manage properties in one place</li>
                      <li className="mb-2">Reach students actively looking near campus</li>
                      <li className="mb-2">You own your listing content; we help display it safely</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Help Tab */}
        {activeTab === "help" && (
          <div className="row g-4">
            <div className="col-lg-8 mx-auto">
              <h2 className="fw-bold text-center mb-5">We&apos;re here to help</h2>

              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq1"
                    >
                      How do I find accommodation?
                    </button>
                  </h3>
                  <div
                    id="faq1"
                    className="accordion-collapse collapse show"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      Use the search bar and filters on the homepage to explore available
                      listings. You can filter by location, price range, and bedspace type.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq2"
                    >
                      Are listings verified?
                    </button>
                  </h3>
                  <div
                    id="faq2"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      Landlord accounts are approved by admin before they can create listings.
                      Listings are shown in a controlled environment; we may review content again
                      if needed to keep the platform safe and accurate.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq3"
                    >
                      How do I contact a landlord?
                    </button>
                  </h3>
                  <div
                    id="faq3"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      Each listing includes direct contact options such as phone or WhatsApp.
                      Click on a property to see the contact information.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq4"
                    >
                      Is UniBoard free to use?
                    </button>
                  </h3>
                  <div
                    id="faq4"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      Students can browse and search listings at no cost. Landlord accounts require
                      verification; any provider fees or terms are communicated when you register
                      as a landlord.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq5"
                    >
                      How do I list my property?
                    </button>
                  </h3>
                  <div
                    id="faq5"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      Register as a landlord, complete verification, and wait for admin approval.
                      Only approved landlords can create listings; your content stays yours, while
                      UniBoard may moderate for safety and quality.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq6"
                    >
                      Who owns my photos and listing text?
                    </button>
                  </h3>
                  <div
                    id="faq6"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      You (the landlord) own your listings and images. UniBoard may display and
                      manage them to run the platform, and may remove or adjust content that violates
                      rules or puts users at risk.
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-5 p-4 bg-light">
                <h5 className="fw-bold mb-3">Need more help?</h5>
                <p className="text-muted mb-3">
                  If you still have questions, reach out to us:
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <MessageCircle size={16} aria-hidden /> WhatsApp: +260 976 449 402
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <Phone size={16} aria-hidden /> Phone: +260 764 388 122
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <Mail size={16} aria-hidden /> Email: contact@uniboard.com
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default About;
