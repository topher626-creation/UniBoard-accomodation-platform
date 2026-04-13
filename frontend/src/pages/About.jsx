import { useState } from "react";
import { Link } from "react-router-dom";

function About() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">About UniBoard</h1>
          <p className="lead opacity-75">
            Connecting students with verified accommodation since 2024
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
              <h2 className="fw-bold mb-4">🔒 Security First</h2>
              <p className="lead text-muted mb-4">
                We prioritize student safety at every step. All listings and property providers
                undergo a structured verification process to ensure trust, reliability, and peace
                of mind when choosing accommodation.
              </p>

              <h2 className="fw-bold mb-4">🌍 Centralized Access</h2>
              <p className="lead text-muted mb-4">
                Finding accommodation shouldn't be stressful. UniBoard brings together verified
                bedspace options near major university areas into one easy-to-use platform—
                saving you time and effort.
              </p>

              <h2 className="fw-bold mb-4">🎓 Focus on What Matters</h2>
              <p className="lead text-muted">
                By simplifying the search for accommodation, we allow students to concentrate
                on their academic journey. Spend less time worrying about where to stay and
                more time succeeding in your studies.
              </p>
            </div>
          </div>
        )}

        {/* How it Works Tab */}
        {activeTab === "how" && (
          <div className="row g-4">
            <div className="col-lg-10 mx-auto">
              <h2 className="fw-bold text-center mb-5">🧭 Simple, Fast, Reliable</h2>
              
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
              <h2 className="fw-bold text-center mb-5">🛠️ Designed for Students and Property Providers</h2>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card h-100 p-4 border-primary">
                    <h4 className="fw-bold mb-3">🧑‍🎓 For Students</h4>
                    <ul className="list-unstyled">
                      <li className="mb-2">✓ Easy search for verified bedspaces</li>
                      <li className="mb-2">✓ Smart filters for faster decisions</li>
                      <li className="mb-2">✓ Direct communication with providers</li>
                      <li className="mb-2">✓ Reliable and safe accommodation options</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 p-4 border-success">
                    <h4 className="fw-bold mb-3">🏠 For Landlords & Agents</h4>
                    <ul className="list-unstyled">
                      <li className="mb-2">✓ List and manage properties (simple & efficient)</li>
                      <li className="mb-2">✓ Reach a targeted student audience</li>
                      <li className="mb-2">✓ Track availability and inquiries</li>
                      <li className="mb-2">✓ Increase occupancy with minimal effort</li>
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
              <h2 className="fw-bold text-center mb-5">🆘 We're Here to Help</h2>

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
                      Yes. All properties and providers go through a structured verification
                      process before being listed on our platform.
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
                      Yes, students can browse and search listings at no cost. Providers pay
                      a small fee to list their properties.
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
                      Create a provider account, submit your property details, and wait for
                      admin approval before your listing goes live.
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-5 p-4 bg-light">
                <h5 className="fw-bold mb-3">📞 Need More Help?</h5>
                <p className="text-muted mb-3">
                  If you still have questions, reach out to us:
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2">📱 WhatsApp: +260 976 449 402</li>
                  <li className="mb-2">📞 Phone: +260 764 388 122</li>
                  <li className="mb-2">✉️ Email: contact@uniboard.com</li>
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
