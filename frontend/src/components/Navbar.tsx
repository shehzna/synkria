import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Calendar, User, FileText, LogOut, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/calendar', label: 'Calendar', icon: Calendar },
        { path: '/log', label: 'Log Data', icon: FileText },
      ]
    : [];

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-semibold text-xl text-foreground">Synkria</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button variant={isActive(link.path) ? 'secondary' : 'ghost'} size="sm" className={isActive(link.path) ? 'bg-primary-light text-accent-foreground' : ''}>
                <link.icon className="w-4 h-4 mr-1.5" />{link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Hi, {user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1.5" />Logout</Button>
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/signup"><Button size="sm" className="bg-gradient-primary hover:opacity-90">Sign Up</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant={isActive(link.path) ? 'secondary' : 'ghost'} className={`w-full justify-start ${isActive(link.path) ? 'bg-primary-light' : ''}`}>
                  <link.icon className="w-4 h-4 mr-2" />{link.label}
                </Button>
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              {isAuthenticated ? (
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Login</Button></Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full bg-gradient-primary">Sign Up</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
