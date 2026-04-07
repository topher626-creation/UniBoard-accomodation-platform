import { useState, useEffect } from "react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropertyCard from "../components/PropertyCard";
import { useAuthStore } from "../stores/authStore.ts";
import { apiClient } from "../lib/api.ts";

const QUICK_AREAS = ["Kitwe", "Lusaka", "Garneton", "Pathfinder", "Mbachi"];
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

  useEffect(() => {
    fetchProperties();
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

  const handleSearch = () => fetchProperties(searchTerm.trim());

  return (
    <div className="min-h-screen bg-slate-50">
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.p variants={fadeUp} className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
            Trusted student accommodation marketplace
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl">
            Find your next student home with confidence.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-blue-100 text-lg max-w-2xl">
            UniBoard helps students discover verified rooms, compare options quickly, and contact landlords in minutes.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Button className="bg-white text-slate-900 font-semibold" onClick={() => navigate("/register")}>
              Get Started
            </Button>
            <Button variant="bordered" className="border-white/60 text-white" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>
              Browse Listings
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <Card className="shadow-xl border border-slate-200">
          <CardBody className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                size="lg"
                placeholder="Search by location, property, or compound"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                startContent={<span className="text-slate-400">🔎</span>}
              />
              <Button size="lg" className="bg-blue-600 text-white font-semibold" onClick={handleSearch}>
                Search
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => {
                    setSearchTerm(area);
                    fetchProperties(area);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {area}
                </button>
              ))}
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
              <Card className="border border-slate-200">
                <CardBody className="text-center">
                  <p className="text-3xl font-bold text-blue-700">
                    {animatedStats[index]}
                    {stat.suffix}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
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
              <Card className="border border-slate-200">
                <CardBody>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{desc}</p>
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
            <h2 className="text-3xl font-bold text-slate-900">Featured Properties</h2>
            <p className="text-slate-600 mt-1">{properties.length} listing{properties.length === 1 ? "" : "s"} available</p>
          </div>
          {user?.role === "landlord" && (
            <Button className="bg-emerald-600 text-white" onClick={() => navigate("/create-listing")}>
              Add Property
            </Button>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-slate-600">Loading properties...</div>
        ) : properties.length === 0 ? (
          <Card className="border border-slate-200">
            <CardBody className="text-center py-14">
              <p className="text-slate-700 font-medium">No properties found.</p>
              <p className="text-slate-500 mt-1">Try a different search term.</p>
              <Button className="mt-4 bg-blue-600 text-white" onClick={() => { setSearchTerm(""); fetchProperties(); }}>
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
              <motion.div key={property.id} variants={fadeUp} className="transition-transform duration-200 hover:-translate-y-1">
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">What students are saying</h2>
          <p className="text-slate-600 mt-1">Real stories from UniBoard users.</p>
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
              <Card className="border border-slate-200">
                <CardBody>
                  <p className="text-slate-700 italic">"{item.quote}"</p>
                  <div className="mt-4">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.tag}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <footer className="bg-slate-900 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white">UniBoard</h3>
            <p className="text-sm text-slate-400 mt-2">
              Student accommodation made simple, transparent, and trusted.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><button onClick={() => navigate("/")} className="hover:text-white">Browse Listings</button></li>
              <li><button onClick={() => navigate("/register")} className="hover:text-white">Create Account</button></li>
              <li><button onClick={() => navigate("/login")} className="hover:text-white">Sign In</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>help@uniboard.app</li>
              <li>+260 955 000 000</li>
              <li>Lusaka, Zambia</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Follow</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a></li>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a></li>
              <li><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white">X (Twitter)</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} UniBoard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}