import { ShieldCheck, Cpu, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 25, 0.95)',
      padding: '2.5rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            CareerOS AI Platform
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Autonomous AI Internship & Job Application Operating System.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={16} color="var(--success)" />
            Zero-Hallucination Fact Guardrails
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Lock size={16} color="var(--accent-primary)" />
            Human-in-the-Loop Verification Gate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Cpu size={16} color="#ec4899" />
            Centralized OpenAI Reasoning Engine
          </div>
        </div>
      </div>
    </footer>
  );
}
