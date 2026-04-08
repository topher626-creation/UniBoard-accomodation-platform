import { useState, useEffect } from "react";
import { Button, Card, CardBody, Input, Chip } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropertyCard from "../components/PropertyCard";
import { useAuthStore } from "../stores/authStore.ts";
import { apiClient } from "../lib/api.ts";

const QUICK_AREAS = ["Lusaka", "Kitwe", "Garneton", "Mbachi", "Pathfinder", "Zambia Compound", "Halawa"];
const POPULAR_COMPOUNDS = ["Mbachi", "Garneton", "Jilafu", "Zebra", "Pathfinder", "Zambia Compound"];
const TOP_CAMPUSES = ["UNZA", "CBU", "NIPA", "Mulungushi", "ZCAS", "Cavendish"];
const TRUST_PILLARS = ["Verified listings", "Secure contact flow", "Landlord moderation", "Fast support"];
const TARGET_STATS = [
  { label: "Active Listings", value: 1200, suffix: "+" },
  { label: "Students Housed", value: 18500, suffix: "+" },
  { label: "Partner Landlords", value: 460, suffix: "+" },
  { label: "Satisfaction Rate", value: 98, suffix: "%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [animatedStats, setAnimatedStats] = useState(TARGET_STATS.map(() => 0));
  const [showBackToTop, setShowBackToTop] = useState(false);
  const primaryButtonClass = "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg";

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const durationMs = 1200;
    const frameMs = 30;
    const steps = Math.ceil(durationMs / frameMs);
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const progress = Math.min(current / steps, 1);
      setAnimatedStats(
        TARGET_STATS.map((stat) => Math.floor(stat.value * progress))
      );

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, frameMs);

    return () => clearInterval(timer);
  }, []);

  const fetchProperties = async (search = "") => {
    try {
      setLoading(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiClient.get(`/properties${query}`);
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchProperties(searchTerm.trim());
    }
  };

  const handleQuickSearch = (term) => {
    setSearchTerm(term);
    fetchProperties(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchProperties("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-950 text-white"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.p variants={fadeUp} className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
            Trusted student accommodation marketplace
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl">
            Find your next student home with confidence.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-blue-100 text-lg max-w-2xl">
            UniBoard helps students discover verified rooms, compare options quickly, and contact landlords directly in minutes.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-2">
            {TRUST_PILLARS.map((item) => (
              <Chip key={item} variant="flat" className="bg-white/15 text-white border border-white/20">
                {item}
              </Chip>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Button className="bg-white text-slate-900 font-semibold rounded-lg" onClick={() => navigate("/register")}>
              Get Started
            </Button>
            <Button variant="bordered" className="border-white/60 text-white" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>
              Browse Listings
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <Card className="shadow-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
          <CardBody className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Find Your Perfect Student Accommodation
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Search by location, compound name, or property name
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Input
                  size="lg"
                  placeholder="Search by location, compound, or property (e.g., Mbachi, UNZA, Garneton)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  startContent={<span className="text-slate-400 text-lg">🔍</span>}
                  endContent={
                    searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        ✕
                      </button>
                    )
                  }
                />
              </div>
              <Button size="lg" className={`${primaryButtonClass} px-8`} onClick={handleSearch}>
                Search
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Popular Areas</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AREAS.map((area) => (
                    <button
                      key={area}
                      onClick={() => handleQuickSearch(area)}
                      className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Popular Compounds</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_COMPOUNDS.map((compound) => (
                    <button
                      key={compound}
                      onClick={() => handleQuickSearch(compound)}
                      className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    >
                      {compound}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Campus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {TOP_CAMPUSES.map((campus) => (
                    <Chip
                      key={campus}
                      size="sm"
                      variant="bordered"
                      className="text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                      onClick={() => handleQuickSearch(campus)}
                    >
                      {campus}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
      >
        <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {TARGET_STATS.map((stat, index) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardBody className="text-center">
                  <p className="text-3xl font-bold text-blue-700">
                    {animatedStats[index]}
                    {stat.suffix}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{stat.label}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={stagger} className="grid md:grid-cols-3 gap-4">
          {[
            ["Verified Listings", "Every listing is moderated for quality and trust."],
            ["Student-First", "Simple filters and quick contact flow for students."],
            ["Landlord Tools", "Manage properties, occupancy, and availability."],
          ].map(([title, desc]) => (
            <motion.div key={title} variants={fadeUp}>
              <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardBody>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{desc}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Properties</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">{properties.length} listing{properties.length === 1 ? "" : "s"} available</p>
          </div>
          {user?.role === "landlord" && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg" onClick={() => navigate("/create-listing")}>
              Add Property
            </Button>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-slate-600">Loading properties...</div>
        ) : properties.length === 0 ? (
          <Card className="border border-slate-200">
            <CardBody className="text-center py-14">
              <p className="text-slate-700 dark:text-slate-200 font-medium">No properties found.</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Try a different search term.</p>
              <Button className={`mt-4 ${primaryButtonClass}`} onClick={() => { setSearchTerm(""); fetchProperties(); }}>
                Reset Search
              </Button>
            </CardBody>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {properties.map((property) => (
              <motion.div
                key={property.id}
                variants={fadeUp}
                whileHover={{ y: -6, rotateX: 2, rotateY: -2, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <Card className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white border-0">
          <CardBody className="py-6 px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xl font-semibold">PRD-aligned student flow</p>
              <p className="text-blue-100 text-sm mt-1">
                Browse listings, review availability, and contact landlords directly via call/WhatsApp.
              </p>
            </div>
            <Button
              className="bg-white text-slate-900 font-semibold rounded-lg"
              onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Listings
            </Button>
          </CardBody>
        </Card>
      </section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What students are saying</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Real stories from UniBoard users.</p>
        </motion.div>
        <motion.div variants={stagger} className="grid md:grid-cols-3 gap-4">
          {[
            {
              name: "Chipo M.",
              quote: "I found a clean and affordable room in two days. The contact process was super fast.",
              tag: "UNZA Student",
            },
            {
              name: "Brian K.",
              quote: "The filters saved me so much time. I compared areas and got exactly what I needed.",
              tag: "CBU Student",
            },
            {
              name: "Thandiwe L.",
              quote: "As a landlord, listing on UniBoard brought serious student inquiries within a week.",
              tag: "Landlord",
            },
          ].map((item) => (
            <motion.div key={item.name} variants={fadeUp}>
              <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
                <CardBody>
                  <p className="text-slate-700 dark:text-slate-200 italic">"{item.quote}"</p>
                  <div className="mt-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.tag}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <footer className="bg-slate-950 text-slate-200 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white">UniBoard</h3>
            <p className="text-sm leading-6 text-slate-400 mt-2">
              Student accommodation made simple, transparent, and trusted.
            </p>
            <div className="mt-4 inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              Student-first accommodation platform
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wide">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><button onClick={() => navigate("/")} className="hover:text-white transition-colors">Browse Listings</button></li>
              <li><button onClick={() => navigate("/register")} className="hover:text-white transition-colors">Create Account</button></li>
              <li><button onClick={() => navigate("/login")} className="hover:text-white transition-colors">Sign In</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wide">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>help@uniboard.app</li>
              <li>+260 955 000 000</li>
              <li>Lusaka, Zambia</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-wide">Follow</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">X (Twitter)</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} UniBoard. All rights reserved. Contact-first booking model.
        </div>
      </footer>

      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 text-white shadow-lg px-4 py-3 hover:bg-blue-700"
          aria-label="Back to top"
        >
          ↑ Top
        </motion.button>
      )}
    </div>
  );
}