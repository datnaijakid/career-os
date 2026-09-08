import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Search,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '650px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 80%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.75rem'
          }}>
            <Sparkles size={16} />
            <span>AI-Powered Career Operating System</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            color: '#ffffff'
          }}>
            Discover eligible roles & apply with <span style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>precision AI assistance</span>.
          </h1>

          <p style={{
            fontSize: '1.2rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto'
          }}>
            Parse your resume into structured facts, analyze any public job posting URL, detect missing application details, and generate accurate answers grounded exclusively in verified truth.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ minWidth: '180px' }}>
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg" style={{ minWidth: '150px' }}>
              <span>Sign In</span>
            </Link>
          </div>

          {/* Quick Pillars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginTop: '4.5rem',
            textAlign: 'left'
          }}>
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'var(--success)'
              }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Zero Fabrication</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                The AI never hallucinates skills, degrees, work authorization, or experience. If data is unknown, it stops and asks you.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'var(--accent-primary)'
              }}>
                <BrainCircuit size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Deterministic Matching</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Compares required skills, preferred qualifications, and education to return an interpretable score with strengths and gaps.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#ec4899'
              }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verification Gate</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Nothing is submitted until you review every field, question answer, and explicitly check the authorization checkbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section style={{ padding: '4rem 0', background: 'rgba(17, 24, 39, 0.4)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              End-to-End Architecture
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>
              How the Career OS Works
            </h2>
            <p style={{ maxWidth: '600px', margin: '0.5rem auto 0 auto', fontSize: '1rem' }}>
              A deterministic pipeline with continuous human confirmation at critical decision points.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.1)', position: 'absolute', top: '1rem', right: '1.5rem' }}>01</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Upload & Extract</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Upload your PDF or DOCX resume. Secure extraction pulls structured education, experience, skills, and projects.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.1)', position: 'absolute', top: '1rem', right: '1.5rem' }}>02</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Profile Confirmation</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                You inspect every extracted detail. Confirm, edit, or add missing points. Only verified information is saved as authoritative fact.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.1)', position: 'absolute', top: '1rem', right: '1.5rem' }}>03</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Ingest Job URL</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Paste any job or internship link. Our analyzer isolates technical requirements and scores your match with full reasoning.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.1)', position: 'absolute', top: '1rem', right: '1.5rem' }}>04</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>4. Missing Info & Answers</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Missing legal authorization or salary requirements prompt immediate questions. Open-ended questions are drafted strictly from your facts.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.1)', position: 'absolute', top: '1rem', right: '1.5rem' }}>05</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>5. Verification Gate</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Complete review screen with explicit authorization requirement before moving to submitted status in your application tracker.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.1)', position: 'absolute', top: '1rem', right: '1.5rem' }}>06</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>6. Lifecycle Tracker</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Monitor every application across 9 standardized states with complete chronological event audit logging.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Account to Start Applying
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
