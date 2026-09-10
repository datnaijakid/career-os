'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Code2,
  Save,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { SKILL_CATEGORIES } from '@/lib/constants';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New skill input state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('languages');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        personal: {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          portfolioUrl: profile.portfolioUrl
        },
        education: profile.educations || [],
        experience: profile.experiences || [],
        projects: profile.projects || [],
        skills: profile.skills || [],
        certifications: profile.certifications || [],
        workAuthorization: profile.workAuthorization,
        expectedSalary: profile.expectedSalary
      };

      const res = await fetch('/api/profile/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setMessage({ type: 'success', text: 'Authoritative profile updated successfully.' });
      fetchProfile();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const currentSkills = profile.skills || [];
    setProfile({
      ...profile,
      skills: [...currentSkills, { name: newSkillName.trim(), category: newSkillCategory }]
    });
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    const updated = profile.skills.filter((_: any, i: number) => i !== index);
    setProfile({ ...profile, skills: updated });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      educations: [
        ...(profile.educations || []),
        { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '', coursework: '' }
      ]
    });
  };

  const removeEducation = (index: number) => {
    const updated = profile.educations.filter((_: any, i: number) => i !== index);
    setProfile({ ...profile, educations: updated });
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experiences: [
        ...(profile.experiences || []),
        { company: '', role: '', startDate: '', endDate: '', description: '', achievements: '' }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const updated = profile.experiences.filter((_: any, i: number) => i !== index);
    setProfile({ ...profile, experiences: updated });
  };

  const addProject = () => {
    setProfile({
      ...profile,
      projects: [
        ...(profile.projects || []),
        { title: '', description: '', technologies: '', link: '' }
      ]
    });
  };

  const removeProject = (index: number) => {
    const updated = profile.projects.filter((_: any, i: number) => i !== index);
    setProfile({ ...profile, projects: updated });
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading candidate profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ maxWidth: '640px', textAlign: 'center', paddingTop: '5rem' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <FileText size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>No Profile Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Upload a resume to automatically extract and initialize your structured candidate profile.
          </p>
          <Link href="/resume" className="btn btn-primary btn-lg">
            Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1080px', paddingTop: '3rem' }}>
      {/* Top action bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Candidate Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Verified authoritative data used for matching and application generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/resume" className="btn btn-secondary">
            <FileText size={16} />
            <span>Upload New Resume</span>
          </Link>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          marginBottom: '2rem'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Personal Details */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--accent-primary)" />
            <span>Personal Information</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone Number</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location / City</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LinkedIn Profile URL</label>
              <input
                type="text"
                value={profile.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GitHub Profile URL</label>
              <input
                type="text"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Portfolio / Personal Site</label>
              <input
                type="text"
                value={profile.portfolioUrl || ''}
                onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work Authorization</label>
              <input
                type="text"
                value={profile.workAuthorization || ''}
                placeholder="e.g. Authorized to work without sponsorship"
                onChange={(e) => setProfile({ ...profile, workAuthorization: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="var(--accent-primary)" />
              <span>Education</span>
            </h2>
            <button onClick={addEducation} className="btn btn-sm btn-secondary">
              <Plus size={14} />
              <span>Add Education</span>
            </button>
          </div>

          {(profile.educations || []).map((edu: any, idx: number) => (
            <div key={idx} style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <button
                onClick={() => removeEducation(idx)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                title="Remove Education"
              >
                <Trash2 size={16} />
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Institution</label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const updated = [...profile.educations];
                      updated[idx].institution = e.target.value;
                      setProfile({ ...profile, educations: updated });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Degree & Major</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const updated = [...profile.educations];
                      updated[idx].degree = e.target.value;
                      setProfile({ ...profile, educations: updated });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expected Graduation / End</label>
                  <input
                    type="text"
                    value={edu.endDate || ''}
                    onChange={(e) => {
                      const updated = [...profile.educations];
                      updated[idx].endDate = e.target.value;
                      setProfile({ ...profile, educations: updated });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GPA</label>
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => {
                      const updated = [...profile.educations];
                      updated[idx].gpa = e.target.value;
                      setProfile({ ...profile, educations: updated });
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Relevant Coursework</label>
                <input
                  type="text"
                  value={edu.coursework || ''}
                  placeholder="e.g. Data Structures, Distributed Systems, Computer Networks"
                  onChange={(e) => {
                    const updated = [...profile.educations];
                    updated[idx].coursework = e.target.value;
                    setProfile({ ...profile, educations: updated });
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Experience Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="#60a5fa" />
              <span>Work & Internship Experience</span>
            </h2>
            <button onClick={addExperience} className="btn btn-sm btn-secondary">
              <Plus size={14} />
              <span>Add Experience</span>
            </button>
          </div>

          {(profile.experiences || []).map((exp: any, idx: number) => (
            <div key={idx} style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <button
                onClick={() => removeExperience(idx)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                title="Remove Experience"
              >
                <Trash2 size={16} />
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Company</label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => {
                      const updated = [...profile.experiences];
                      updated[idx].company = e.target.value;
                      setProfile({ ...profile, experiences: updated });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Position / Role</label>
                  <input
                    type="text"
                    value={exp.role || ''}
                    onChange={(e) => {
                      const updated = [...profile.experiences];
                      updated[idx].role = e.target.value;
                      setProfile({ ...profile, experiences: updated });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dates (e.g. May 2024 - Aug 2024)</label>
                  <input
                    type="text"
                    value={`${exp.startDate || ''}${exp.endDate ? ` - ${exp.endDate}` : ''}`}
                    onChange={(e) => {
                      const updated = [...profile.experiences];
                      updated[idx].startDate = e.target.value;
                      setProfile({ ...profile, experiences: updated });
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Responsibilities & Achievements</label>
                <textarea
                  rows={3}
                  value={exp.description || exp.achievements || ''}
                  onChange={(e) => {
                    const updated = [...profile.experiences];
                    updated[idx].description = e.target.value;
                    setProfile({ ...profile, experiences: updated });
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={20} color="var(--success)" />
            <span>Technical Skills</span>
          </h2>

          {/* Add skill row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. Next.js, Python, PostgreSQL"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              style={{ maxWidth: '320px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              style={{ maxWidth: '220px' }}
            >
              {SKILL_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <button type="button" onClick={addSkill} className="btn btn-secondary">
              <Plus size={16} />
              <span>Add Skill</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {(profile.skills || []).map((skill: any, idx: number) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#c7d2fe',
                  fontSize: '0.85rem'
                }}
              >
                <span>{skill.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({skill.category})</span>
                <button
                  onClick={() => removeSkill(idx)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderGit2 size={20} color="var(--info)" />
              <span>Projects</span>
            </h2>
            <button onClick={addProject} className="btn btn-sm btn-secondary">
              <Plus size={14} />
              <span>Add Project</span>
            </button>
          </div>

          {(profile.projects || []).map((proj: any, idx: number) => (
            <div key={idx} style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <button
                onClick={() => removeProject(idx)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                title="Remove Project"
              >
                <Trash2 size={16} />
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Title</label>
                  <input
                    type="text"
                    value={proj.title || ''}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].title = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Technologies Used</label>
                  <input
                    type="text"
                    value={proj.technologies || ''}
                    placeholder="e.g. Next.js, OpenAI API, SQLite"
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].technologies = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Repository / Demo Link</label>
                  <input
                    type="text"
                    value={proj.link || ''}
                    placeholder="https://github.com/..."
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].link = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  rows={2}
                  value={proj.description || ''}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].description = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
