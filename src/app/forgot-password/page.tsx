'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate reset link dispatch
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="container" style={{
      maxWidth: '440px',
      paddingTop: '4rem',
      paddingBottom: '4rem'
    }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Reset Password</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Enter your registered email to receive password reset instructions.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Check Your Inbox</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              We've dispatched password reset instructions to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <ArrowLeft size={14} />
                <span>Return to login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
