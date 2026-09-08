'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Send,
  History,
  FileCheck,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { APPLICATION_STATUSES, ApplicationStatusType } from '@/lib/constants';

interface ApplicationItem {
  id: string;
  status: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  job: {
    title: string;
    company: string;
    location?: string;
    url?: string;
  };
  answers: Array<{
    question: string;
    answer: string;
  }>;
  events: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (appId: string, title: string, company: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete your application for "${title}" at "${company}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(appId);
    setBannerMessage(null);

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete application');

      setApplications(prev => prev.filter(a => a.id !== appId));
      setBannerMessage({ type: 'success', text: `Application for "${title}" at "${company}" deleted.` });
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Error deleting application.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    if (selectedFilter === 'ALL') return true;
    return app.status === selectedFilter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'OFFER':
        return 'badge-success';
      case 'NEEDS_INFO':
        return 'badge-warning';
      case 'REJECTED':
        return 'badge-danger';
      case 'PREPARING':
      case 'READY_FOR_REVIEW':
      case 'INTERVIEW':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading applications tracker...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1080px', paddingTop: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Application Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track statuses, audit application timelines, and manage interviews.
          </p>
        </div>

        <Link href="/apply" className="btn btn-primary">
          <Plus size={16} />
          <span>Apply to a Job</span>
        </Link>
      </div>

      {bannerMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: bannerMessage.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: bannerMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${bannerMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          marginBottom: '1.5rem'
        }}>
          {bannerMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`btn btn-sm ${selectedFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All ({applications.length})
        </button>
        {Object.entries(APPLICATION_STATUSES).map(([key, val]) => {
          const count = applications.filter(a => a.status === key).length;
          if (count === 0 && selectedFilter !== key) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={`btn btn-sm ${selectedFilter === key ? 'btn-primary' : 'btn-secondary'}`}
            >
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Briefcase size={44} color="var(--accent-primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Applications Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {selectedFilter === 'ALL'
              ? 'You haven’t started any applications yet. Paste a job posting URL to begin.'
              : `No applications with status "${APPLICATION_STATUSES[selectedFilter as ApplicationStatusType]?.label || selectedFilter}".`}
          </p>
          <Link href="/apply" className="btn btn-primary">
            Start Your First Application
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredApps.map((app) => {
            const isExpanded = expandedAppId === app.id;
            return (
              <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', transition: 'all 0.2s ease' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>
                        {app.job.title}
                      </h2>
                      <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                        {APPLICATION_STATUSES[app.status as ApplicationStatusType]?.label || app.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={15} /> {app.job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={15} /> Started {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      {app.submittedAt && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)' }}>
                          <CheckCircle2 size={15} /> Submitted {new Date(app.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Status Changer */}
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{ maxWidth: '170px', padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    >
                      {Object.entries(APPLICATION_STATUSES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="btn btn-sm btn-secondary"
                    >
                      <History size={14} />
                      <span>Timeline</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <button
                      onClick={() => handleDeleteApplication(app.id, app.job.title, app.job.company)}
                      disabled={deletingId === app.id}
                      className="btn btn-sm btn-outline"
                      title="Delete Application"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <Trash2 size={14} />
                      <span>{deletingId === app.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Timeline & Details */}
                {isExpanded && (
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}>
                    {/* Answers if present */}
                    {app.answers && app.answers.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.65rem' }}>
                          Verified Application Answers:
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {app.answers.map((ans, aIdx) => (
                            <div key={aIdx} style={{
                              padding: '0.75rem 1rem',
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.85rem'
                            }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                {ans.question}
                              </div>
                              <div style={{ color: 'var(--text-secondary)' }}>
                                {ans.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chronological Event Audit Log */}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>
                        Chronological Event Log:
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {app.events.map((evt) => (
                          <div key={evt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
                            <div style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#818cf8',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              flexShrink: 0
                            }}>
                              {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ color: 'var(--text-primary)' }}>
                              {evt.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
