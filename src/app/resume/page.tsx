'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2
} from 'lucide-react';
import { ExtractedCandidateData } from '@/lib/ai/aiService';

function ResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewAccount = searchParams.get('newAccount') === 'true';

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusStep, setStatusStep] = useState<'idle' | 'uploading' | 'analyzing' | 'review' | 'confirmed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCandidateData | null>(null);
  const [workAuthorization, setWorkAuthorization] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setErrorMessage('Please upload a valid PDF or DOCX resume document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    setStatusStep('uploading');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setStatusStep('analyzing');
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setExtractedData(data.extractedData);
      setStatusStep('review');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing resume.');
      setStatusStep('idle');
    }
  };

  const handleConfirmProfile = async () => {
    if (!extractedData) return;
    try {
      const payload = {
        ...extractedData,
        workAuthorization: workAuthorization || undefined,
        expectedSalary: expectedSalary || undefined
      };

      const res = await fetch('/api/profile/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save confirmed profile');
      }

      setStatusStep('confirmed');
      setTimeout(() => {
        router.push('/dashboard?profileConfirmed=true');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving confirmed profile.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '960px', paddingTop: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        {isNewAccount && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1rem',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={14} />
            <span>Account created! Complete your profile with your resume</span>
          </div>
        )}
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Resume Upload & Analysis</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Upload your resume in PDF or DOCX format. Our server-side OpenAI engine parses your background into structured, verifiable facts.
        </p>
      </div>

      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          background: 'var(--danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--danger)',
          fontSize: '0.9rem',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Uploading state */}
      {(statusStep === 'idle' || statusStep === 'uploading' || statusStep === 'analyzing') && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: 'none' }}
            onChange={handleChange}
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '3.5rem 2rem',
              background: dragActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'var(--accent-gradient-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <UploadCloud size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                {selectedFile ? selectedFile.name : 'Choose or drop your resume here'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Supports PDF or DOCX up to 10MB • Text is sanitized and protected
              </p>
            </div>

            {selectedFile && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#c7d2fe',
                fontSize: '0.85rem'
              }}>
                <FileText size={15} />
                <span>Ready: {(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
            >
              Browse Files
            </button>
            <button
              onClick={startAnalysis}
              disabled={!selectedFile || statusStep === 'uploading' || statusStep === 'analyzing'}
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {statusStep === 'analyzing' ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Extracting Facts...</span>
                </>
              ) : (
                <>
                  <FileText size={16} />
                  <span>Extract Resume Facts</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Human Review Gate ("Is this information accurate?") */}
      {statusStep === 'review' && extractedData && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Important Review Banner */}
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: '#fff' }}>
                Is this extracted information accurate?
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Review what the AI extracted from your resume below. Only confirmed facts will be stored in your authoritative candidate profile and used during application preparation.
              </p>
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Personal Information</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input
                  type="text"
                  value={extractedData.personal.fullName || ''}
                  onChange={(e) => setExtractedData({
                    ...extractedData,
                    personal: { ...extractedData.personal, fullName: e.target.value }
                  })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  value={extractedData.personal.email || ''}
                  onChange={(e) => setExtractedData({
                    ...extractedData,
                    personal: { ...extractedData.personal, email: e.target.value }
                  })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</label>
                <input
                  type="text"
                  value={extractedData.personal.phone || ''}
                  onChange={(e) => setExtractedData({
                    ...extractedData,
                    personal: { ...extractedData.personal, phone: e.target.value }
                  })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</label>
                <input
                  type="text"
                  value={extractedData.personal.location || ''}
                  onChange={(e) => setExtractedData({
                    ...extractedData,
                    personal: { ...extractedData.personal, location: e.target.value }
                  })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LinkedIn URL</label>
                <input
                  type="text"
                  value={extractedData.personal.linkedinUrl || ''}
                  onChange={(e) => setExtractedData({
                    ...extractedData,
                    personal: { ...extractedData.personal, linkedinUrl: e.target.value }
                  })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GitHub URL</label>
                <input
                  type="text"
                  value={extractedData.personal.githubUrl || ''}
                  onChange={(e) => setExtractedData({
                    ...extractedData,
                    personal: { ...extractedData.personal, githubUrl: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="var(--accent-primary)" />
              <span>Education</span>
            </h3>
            {extractedData.education.map((edu, idx) => (
              <div key={idx} style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const copy = [...extractedData.education];
                        copy[idx].institution = e.target.value;
                        setExtractedData({ ...extractedData, education: copy });
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Degree & Major</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const copy = [...extractedData.education];
                        copy[idx].degree = e.target.value;
                        setExtractedData({ ...extractedData, education: copy });
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expected Graduation</label>
                    <input
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) => {
                        const copy = [...extractedData.education];
                        copy[idx].endDate = e.target.value;
                        setExtractedData({ ...extractedData, education: copy });
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GPA (optional)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => {
                        const copy = [...extractedData.education];
                        copy[idx].gpa = e.target.value;
                        setExtractedData({ ...extractedData, education: copy });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Skills Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={20} color="var(--success)" />
              <span>Extracted Technical Skills</span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {extractedData.skills.map((skill, idx) => (
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
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => {
                      const copy = extractedData.skills.filter((_, i) => i !== idx);
                      setExtractedData({ ...extractedData, skills: copy });
                    }}
                    style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="#60a5fa" />
              <span>Experience</span>
            </h3>
            {extractedData.experience.map((exp, idx) => (
              <div key={idx} style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...extractedData.experience];
                        copy[idx].company = e.target.value;
                        setExtractedData({ ...extractedData, experience: copy });
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role / Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...extractedData.experience];
                        copy[idx].role = e.target.value;
                        setExtractedData({ ...extractedData, experience: copy });
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dates</label>
                    <input
                      type="text"
                      value={`${exp.startDate || ''} - ${exp.endDate || ''}`}
                      onChange={(e) => {
                        const copy = [...extractedData.experience];
                        copy[idx].startDate = e.target.value;
                        setExtractedData({ ...extractedData, experience: copy });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description & Achievements</label>
                  <textarea
                    rows={2}
                    value={exp.description || exp.achievements || ''}
                    onChange={(e) => {
                      const copy = [...extractedData.experience];
                      copy[idx].description = e.target.value;
                      setExtractedData({ ...extractedData, experience: copy });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Missing info pre-prompt */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Additional Profile Information (Optional)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Add these now to expedite future applications:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work Authorization</label>
                <select
                  value={workAuthorization}
                  onChange={(e) => setWorkAuthorization(e.target.value)}
                >
                  <option value="">Select status...</option>
                  <option value="Authorized without sponsorship">Authorized to work without sponsorship</option>
                  <option value="Will require sponsorship">Will require future sponsorship (e.g. STEM OPT / H1-B)</option>
                  <option value="Citizen / Permanent Resident">Citizen / Permanent Resident</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expected Compensation / Rate</label>
                <input
                  type="text"
                  placeholder="e.g. $45/hour or $85,000/year"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Confirmation Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => {
                setStatusStep('idle');
                setSelectedFile(null);
              }}
              className="btn btn-secondary"
            >
              Reject & Upload Another
            </button>

            <button
              onClick={handleConfirmProfile}
              className="btn btn-success btn-lg"
              style={{ minWidth: '220px' }}
            >
              <Check size={18} />
              <span>Confirm & Save Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Success */}
      {statusStep === 'confirmed' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Profile Confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your candidate profile is now saved as authoritative fact. Redirecting to your dashboard...
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}><p>Loading...</p></div>}>
      <ResumeContent />
    </Suspense>
  );
}
