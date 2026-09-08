'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  FileText,
  Send,
  Building2,
  MapPin,
  ExternalLink,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { APPLICATION_STATUSES, ApplicationStatusType } from '@/lib/constants';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
      fetch('/api/applications').then(r => r.json())
    ]).then(([userData, profileData, jobsData, appsData]) => {
      setUser(userData.user);
      setProfile(profileData.profile);
      setMatches(jobsData.matches || []);
      setApplications(appsData.applications || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const strongMatchesCount = matches.filter(m => m.matchScore >= 80).length;
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW').length;

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading CareerOS Dashboard...</p>
      </div>
    );
  }

  const displayName = profile?.fullName || user?.name || 'Candidate';

  return (
    <div className="container" style={{ maxWidth: '1180px', paddingTop: '2.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', color: '#fff' }}>
            {getGreeting()}, {displayName} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome to your career command center. Here is the latest on your applications and job matches.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/apply" className="btn btn-primary">
            <Send size={16} />
            <span>Apply to a Job</span>
          </Link>
          <Link href="/resume" className="btn btn-secondary">
            <FileText size={16} />
            <span>Upload Resume</span>
          </Link>
        </div>
      </div>

      {/* Profile Verification Prompt if unconfirmed */}
      {!profile?.confirmedAt && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={22} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>Set up your verified candidate profile</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Upload your resume so the AI can extract and match your qualifications to jobs.
              </p>
            </div>
          </div>
          <Link href="/resume" className="btn btn-sm btn-primary">
            Upload Resume Now
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Matching Jobs
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
            {matches.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Analyzed roles
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Strong Matches
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
            {strongMatchesCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Score ≥ 80%
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Applications
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
            {applications.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            In pipeline
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interviews
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ec4899', marginTop: '0.25rem' }}>
            {interviewCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Active interview rounds
          </div>
        </div>
      </div>

      {/* Split Section: Recommended Matches & Active Applications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
        {/* Recommended Jobs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>Recommended & Matched Jobs</h2>
            <Link href="/apply" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>+ Add Job Link</span>
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Building2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No Jobs Analyzed Yet</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Paste any internship or job posting URL to analyze eligibility and match fit.
              </p>
              <Link href="/apply" className="btn btn-sm btn-primary">
                Analyze First Job
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matches.slice(0, 5).map((match) => (
                <div key={match.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.2rem' }}>
                        {match.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{match.company}</span>
                        {match.location && <span>• {match.location}</span>}
                      </div>
                    </div>

                    <div style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      background: match.matchScore >= 80 ? 'var(--success-bg)' : match.matchScore >= 60 ? 'var(--warning-bg)' : 'var(--danger-bg)',
                      color: match.matchScore >= 80 ? 'var(--success)' : match.matchScore >= 60 ? 'var(--warning)' : 'var(--danger)',
                      border: `1px solid ${match.matchScore >= 80 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                    }}>
                      {match.matchScore}% Match
                    </div>
                  </div>

                  {match.strengths && match.strengths.length > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--success)' }}>✓ Strengths: </span>
                      {match.strengths.slice(0, 2).join(' • ')}
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      href={`/apply?url=${encodeURIComponent(match.url || '')}`}
                      className="btn btn-sm btn-outline"
                    >
                      <span>Prepare Application</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>Application Pipeline</h2>
            <Link href="/applications" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
              View All ({applications.length})
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No Active Applications</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Your submitted and in-progress applications will appear here.
              </p>
              <Link href="/apply" className="btn btn-sm btn-primary">
                Apply to a Role
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.2rem' }}>
                        {app.job.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {app.job.company}
                      </div>
                    </div>

                    <span className={`badge ${
                      app.status === 'SUBMITTED' || app.status === 'OFFER' ? 'badge-success' :
                      app.status === 'NEEDS_INFO' ? 'badge-warning' :
                      app.status === 'REJECTED' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {APPLICATION_STATUSES[app.status as ApplicationStatusType]?.label || app.status}
                    </span>
                  </div>

                  <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Started: {new Date(app.createdAt).toLocaleDateString()}</span>
                    {app.submittedAt && (
                      <span style={{ color: 'var(--success)' }}>
                        Submitted {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
