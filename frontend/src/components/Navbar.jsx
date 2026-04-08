import { useEffect, useState } from "react";
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";
import { useAuthActions } from "../hooks/useAuth.ts";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Lusaka");
  const [isAtTop, setIsAtTop] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthActions();

  const cities = ["Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola", "Mufulira", "Luanshya", "Livingstone", "Chipata", "Kasama"];
  const dashboardRoute = user?.role === "admin" ? "/admin" : user?.role === "landlord" ? "/landlord" : null;

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY === 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedCity)}`);
      setMenuOpen(false);
    }
  };

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed z-40 flex flex-col w-full transition-all duration-500 group translate-y-0 ${isAtTop ? "" : 'data-at-top="false"'}`} data-at-top={isAtTop ? "true" : "false"}>
      <div className="w-full flex items-center gap-4 px-4 py-3 lg:px-8 lg:py-6 rounded-b-2.5xl lg:rounded-b-5xl justify-between bg-purple-200 drop-shadow-[0_4px_9.4px_rgba(0,0,0,0.1)] group-data-[at-top=false]:bg-white group-data-[at-top=false]:drop-shadow-lg">
        <button type="button" onClick={() => goTo("/")} className="w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">U</span></div>
            <span className="text-xl font-bold text-gray-800 group-data-[at-top=false]:text-gray-900">UniBoard</span>
          </div>
        </button>

        <div className="contents lg:hidden">
          <div className="flex items-center gap-4">
            <div className={`flex gap-1 rounded-full transition-all delay-200 group-data-[at-top=true]:hidden group-data-[at-top=false]:bg-white group-data-[at-top=true]:bg-black/20 group-data-[at-top=false]:text-black group-data-[at-top=true]:text-white group-data-[at-top=true]:backdrop-blur-md`}>
              <form onSubmit={handleSearch} className="w-full">
                <Button type="submit" variant="solid" className="bg-gray-700 text-white px-4 py-2 size-[30px] min-w-[30px]" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" width="16" height="16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.583 17.5a7.917 7.917 0 1 0 0-15.833 7.917 7.917 0 0 0 0 15.833M18.333 18.333l-1.666-1.666" /></svg>
                </Button>
              </form>
            </div>
            <div className="contents">
              <Button variant="light" className="bg-transparent text-gray-700 outline-offset-0 p-0 group-data-[at-top=false]:text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" className="size-6 text-white group-data-[at-top=false]:text-gray-700"><path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M3.898 7.971h18M3.898 12.971h18M3.898 17.971h18" /></svg>
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden lg:contents">
          <div className={`flex h-[46px] items-center justify-center rounded-full px-8 py-0.5 transition-all delay-200 group-data-[at-top=false]:bg-white group-data-[at-top=true]:bg-gray-700/20 group-data-[at-top=true]:py-2 group-data-[at-top=false]:pl-8 group-data-[at-top=false]:pr-0 group-data-[at-top=false]:text-black group-data-[at-top=true]:text-white group-data-[at-top=true]:backdrop-blur-md`}>
            <div className="transition-[width] ease-linear duration-75 flex h-full items-center gap-6 group-data-[at-top=false]:border-r group-data-[at-top=false]:border-gray-200 group-data-[at-top=false]:pr-4 group-data-[at-top=false]:w-[520px]">
              <button type="button" onClick={() => goTo("/")} className={`typography-desktop-text-link transition-colors duration-200 ${isActive("/") ? "font-bold text-blue-600" : "text-gray-700 group-data-[at-top=true]:text-white"}`}>Browse Listings</button>
              {!user && <button type="button" onClick={() => goTo("/register")} className={`typography-desktop-text-link transition-colors duration-200 ${isActive("/register") ? "font-bold text-blue-600" : "text-gray-700 group-data-[at-top=true]:text-white"}`}>Sign Up</button>}
              {dashboardRoute && <button type="button" onClick={() => goTo(dashboardRoute)} className={`typography-desktop-text-link transition-colors duration-200 ${isActive(dashboardRoute) ? "font-bold text-blue-600" : "text-gray-700 group-data-[at-top=true]:text-white"}`}>Dashboard</button>}
            </div>
            <div className="hidden items-center gap-2.5 group-data-[at-top=false]:flex">
              <form onSubmit={handleSearch} className="w-full">
                <div className="z-10 flex flex-col gap-4"><div className="flex w-full flex-col gap-1"><div className="flex w-full rounded-5xl focus-within:border-gray-600 hover:border-gray-600 focus:placeholder:text-transparent h-[46px] relative border-l border-gray-200 border-none"><div className="flex w-full rounded-inherit border border-inherit relative border-none"><Input id="searchBar-navbar" type="search" placeholder="Search by city, college or property" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="placeholder:text-muted-foreground flex rounded-5xl bg-white p-4 outline-none ring-offset-white file:bg-transparent file:text-sm file:font-medium focus:placeholder-transparent transition-[width] duration-300 z-10 h-[46px] w-0 pl-0 pr-[55px] max-w-[535px]" /><div className="flex gap-1"><div className="absolute right-[-7px] z-10 flex h-full w-16 items-center justify-center"><Button type="submit" variant="solid" className="bg-gray-700 text-white size-[30px] p-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" height="16" width="16" className="text-white"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.583 17.5a7.917 7.917 0 1 0 0-15.833 7.917 7.917 0 0 0 0 15.833M18.333 18.333l-1.666-1.666" /></svg></Button></div></div></div></div></div></div>
              </form>
            </div>
          </div>
          <div className="flex gap-2">
            {user ? <Dropdown><DropdownTrigger><Button variant="light" className="h-12 w-full p-4 bg-white text-gray-700">{user.name || user.email}</Button></DropdownTrigger><DropdownMenu aria-label="User menu">{dashboardRoute && <DropdownItem onClick={() => navigate(dashboardRoute)}>{user.role === "admin" ? "Admin Panel" : "Landlord Panel"}</DropdownItem>}<DropdownItem onClick={handleLogout}>Logout</DropdownItem></DropdownMenu></Dropdown> : <Button variant="solid" className="h-12 w-full p-4 bg-white text-gray-700" onClick={() => navigate("/login")}>Login or Sign Up</Button>}
          </div>
        </div>
      </div>

      {menuOpen && <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-4 py-4"><div className="flex flex-col gap-4"><form onSubmit={handleSearch} className="flex gap-2"><Dropdown><DropdownTrigger><Button variant="bordered" className="flex-1">{selectedCity}</Button></DropdownTrigger><DropdownMenu aria-label="City selection" onAction={(key) => setSelectedCity(key)}>{cities.map((city) => <DropdownItem key={city}>{city}</DropdownItem>)}</DropdownMenu></Dropdown><Input placeholder="Search properties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" /><Button type="submit" color="primary">Search</Button></form><div className="flex flex-col gap-2"><Button variant="light" className="justify-start" onClick={() => goTo("/")}>Browse Listings</Button>{!user && <Button variant="light" className="justify-start" onClick={() => goTo("/register")}>Sign Up</Button>}{dashboardRoute && <Button variant="light" className="justify-start" onClick={() => goTo(dashboardRoute)}>Dashboard</Button>}</div><div className="border-t border-gray-200 dark:border-slate-700 pt-4">{user ? <div className="flex flex-col gap-2"><span className="text-sm text-gray-600 dark:text-slate-400">Welcome, {user.name || user.email}</span>{dashboardRoute && <Button variant="light" onClick={() => goTo(dashboardRoute)}>{user.role === "admin" ? "Admin Panel" : "Landlord Panel"}</Button>}<Button variant="light" color="danger" onClick={handleLogout}>Logout</Button></div> : <Button variant="solid" color="primary" className="w-full" onClick={() => goTo("/login")}>Login or Sign Up</Button>}</div></div></div>}
    </nav>
  );
}
