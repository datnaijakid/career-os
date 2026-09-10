import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Briefcase,
  FileCheck2,
  Search,
  Sliders,
  Layers,
  FileText
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Hero Section */}
      <section style={{ paddingTop: '5rem', paddingBottom: '4.5rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            color: '#60a5fa',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
            letterSpacing: '0.02em'
          }}>
            <FileCheck2 size={15} />
            <span>Fact-Grounded Job Application Platform</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            marginBottom: '1.25rem',
            color: '#ffffff'
          }}>
            Find verified roles and submit applications with precision.
          </h1>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.25rem auto'
          }}>
            Extract resumes into structured facts, analyze any public job posting URL, detect missing requirements, and generate answers strictly grounded in candidate truth.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ minWidth: '170px' }}>
              <span>Get Started</span>
              <ArrowRight size={17} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg" style={{ minWidth: '140px' }}>
              <span>Sign In</span>
            </Link>
          </div>

          {/* Core Guarantees */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginTop: '4.5rem',
            textAlign: 'left'
          }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'var(--success)'
              }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Zero Fabrication</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Responses are generated exclusively from your confirmed profile facts. If data is missing or unverified, the system prompts you directly.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#60a5fa'
              }}>
                <Sliders size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Deterministic Matching</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Parses hard technical requirements, preferred qualifications, and educational criteria to return an interpretable score with transparent reasoning.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(148, 163, 184, 0.12)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Human Verification Gate</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Nothing is submitted without candidate review. Every answer, field mapping, and dispatch requires explicit legal authorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Structured Workflow
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.4rem' }}>
              How CareerOS Works
            </h2>
            <p style={{ maxWidth: '580px', margin: '0.4rem auto 0 auto', fontSize: '0.95rem' }}>
              A deterministic pipeline combining automated parsing with continuous human oversight.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.08)', position: 'absolute', top: '1rem', right: '1.25rem' }}>01</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>1. Upload & Extract</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Upload your PDF or DOCX resume. High-fidelity extraction isolates education, work history, projects, and technical skills.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.08)', position: 'absolute', top: '1rem', right: '1.25rem' }}>02</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>2. Profile Confirmation</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Inspect extracted details directly. Confirm, edit, or append missing data. Only confirmed facts enter the authoritative candidate store.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.08)', position: 'absolute', top: '1rem', right: '1.25rem' }}>03</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>3. Ingest Job URL</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Paste any job posting URL. The parser connects to ATS endpoints or extracts Schema.org JSON-LD to pull full role descriptions.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.08)', position: 'absolute', top: '1rem', right: '1.25rem' }}>04</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>4. Missing Info & Answers</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Identifies missing application criteria before submission. Answers custom questions using verified candidate milestones with fact citations.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.08)', position: 'absolute', top: '1rem', right: '1.25rem' }}>05</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>5. Verification Gate</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Comprehensive pre-submission audit screen requiring an explicit candidate authorization checkbox before submission is permitted.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.08)', position: 'absolute', top: '1rem', right: '1.25rem' }}>06</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>6. Lifecycle Tracker</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Track applications across standardized statuses with complete chronological audit trails and one-click recommendation management.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Candidate Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
