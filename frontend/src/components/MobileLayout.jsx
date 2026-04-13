import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@nextui-org/react";
import { Menu, X, Home, Search, User, MessageSquare, Settings } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

const MobileLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/search", label: "Search", icon: Search },
    ...(isAuthenticated ? [
      { path: "/bookings", label: "Bookings", icon: MessageSquare },
      { path: "/profile", label: "Profile", icon: User },
    ] : [
      { path: "/login", label: "Login", icon: User },
    ])
  ];

  const isActivePath = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-600">UniBoard</h1>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onClick={handleInstallClick}
              className="text-xs"
            >
              Install App
            </Button>
          )}

          <Button
            isIconOnly
            variant="light"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button isIconOnly variant="light" size="sm" onClick={() => setIsMenuOpen(false)}>
                  <X size={18} />
                </Button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              {isAuthenticated && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Welcome back!</p>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 md:hidden z-30">
        <div className="flex justify-around">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Install Prompt Banner (for mobile browsers) */}
      {isInstallable && (
        <div className="fixed bottom-16 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg md:hidden z-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Install UniBoard</p>
              <p className="text-sm opacity-90">Get the full app experience</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="light" onClick={() => setIsInstallable(false)}>
                Later
              </Button>
              <Button size="sm" className="bg-white text-blue-600" onClick={handleInstallClick}>
                Install
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;