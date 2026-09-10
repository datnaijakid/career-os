'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, UserCheck, Send, Briefcase, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const isPublicPage = ['/', '/login', '/register', '/forgot-password'].includes(pathname);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      height: '70px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Brand */}
        <Link href={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <Briefcase size={17} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              Career<span style={{ color: '#60a5fa' }}>OS</span>
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>Platform</span>
          </div>
        </Link>

        {/* Navigation Links for Authenticated Users */}
        {user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              href="/dashboard"
              className={`btn btn-sm ${pathname === '/dashboard' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ border: pathname === '/dashboard' ? '1px solid var(--accent-primary)' : undefined }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              href="/resume"
              className={`btn btn-sm ${pathname === '/resume' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ border: pathname === '/resume' ? '1px solid var(--accent-primary)' : undefined }}
            >
              <FileText size={16} />
              Resume Upload
            </Link>
            <Link
              href="/profile"
              className={`btn btn-sm ${pathname === '/profile' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ border: pathname === '/profile' ? '1px solid var(--accent-primary)' : undefined }}
            >
              <UserCheck size={16} />
              Profile
            </Link>
            <Link
              href="/apply"
              className={`btn btn-sm ${pathname === '/apply' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ border: pathname === '/apply' ? '1px solid var(--accent-primary)' : undefined }}
            >
              <Send size={16} />
              Apply to Job
            </Link>
            <Link
              href="/applications"
              className={`btn btn-sm ${pathname === '/applications' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ border: pathname === '/applications' ? '1px solid var(--accent-primary)' : undefined }}
            >
              <Briefcase size={16} />
              Tracker
            </Link>
          </nav>
        ) : null}

        {/* Right CTA / User State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {loading ? (
            <div style={{ width: '80px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right', display: 'none', minWidth: '80px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name || user.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-secondary"
                title="Sign Out"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}
              >
                <LogOut size={15} />
                <span style={{ fontSize: '0.8rem' }}>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link href="/login" className="btn btn-sm btn-outline">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-sm btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
