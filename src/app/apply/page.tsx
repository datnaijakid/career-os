'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  FileCheck,
  RefreshCw,
  Edit2,
  Check,
  ExternalLink
} from 'lucide-react';

interface JobData {
  id: string;
  title: string;
  company: string;
  location?: string;
  remoteType?: string;
  employmentType?: string;
  salaryRange?: string;
  deadline?: string;
  url?: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  applicationQuestions?: string[];
}

interface MatchData {
  id: string;
  matchScore: number;
  eligible: boolean;
  qualificationStatus: string;
  strengths: string[];
  missingRequirements: string[];
  uncertainRequirements: string[];
  explanation: string;
}

interface MissingInfoItem {
  key: string;
  label: string;
  type: 'select' | 'text' | 'boolean';
  options?: string[];
  reason: string;
}

function ApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobUrl = searchParams.get('url') || '';

  // Step state: 'input' -> 'analyzing' -> 'match_overview' -> 'missing_info' -> 'answers_studio' -> 'final_review' -> 'submitted'
  const [currentStep, setCurrentStep] = useState<'input' | 'analyzing' | 'match_overview' | 'missing_info' | 'answers_studio' | 'final_review' | 'submitted'>('input');
  const [jobUrl, setJobUrl] = useState(initialJobUrl);
  const [rawJobText, setRawJobText] = useState('');
  const [showPasteText, setShowPasteText] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loaded data
  const [job, setJob] = useState<JobData | null>(null);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [missingInfo, setMissingInfo] = useState<MissingInfoItem[]>([]);
  const [missingAnswers, setMissingAnswers] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Application answers
  const [answers, setAnswers] = useState<Array<{
    id?: string;
    question: string;
    answer: string;
    groundedFacts: string[];
    status: string;
    isEditing?: boolean;
  }>>([]);
  const [generatingAnswerIdx, setGeneratingAnswerIdx] = useState<number | null>(null);

  // Final Gate
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [confirmedAuthCheckbox, setConfirmedAuthCheckbox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [automationReport, setAutomationReport] = useState<any>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => setCandidateProfile(data.profile))
      .catch(console.error);
  }, []);

  // Step 1 -> Step 2: Analyze Job
  const handleAnalyzeJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCurrentStep('analyzing');

    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: jobUrl.trim() || undefined,
          rawJobText: rawJobText.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.canPasteText) {
          setShowPasteText(true);
        }
        throw new Error(data.error || 'Failed to analyze job posting');
      }

      setJob(data.job);
      setMatch(data.match);
      setMissingInfo(data.missingInfo || []);

      // Pre-initialize application questions
      const initialQuestions = (data.job.applicationQuestions || []).map((q: string) => ({
        question: q,
        answer: '',
        groundedFacts: [],
        status: 'UNGENERATED'
      }));
      setAnswers(initialQuestions);

      // Create an application record in database
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: data.job.id,
          initialStatus: (data.missingInfo && data.missingInfo.length > 0) ? 'NEEDS_INFO' : 'PREPARING'
        })
      });
      const appData = await appRes.json();
      if (appData.application) {
        setApplicationId(appData.application.id);
      }

      setCurrentStep('match_overview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error analyzing job posting.');
      setCurrentStep('input');
    }
  };

  // Missing Info Handling
  const handleSaveMissingInfo = async () => {
    // If workAuthorization or expectedSalary were answered, save to profile
    try {
      if (missingAnswers['workAuthorization'] || missingAnswers['expectedSalary']) {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workAuthorization: missingAnswers['workAuthorization'] || candidateProfile?.workAuthorization,
            expectedSalary: missingAnswers['expectedSalary'] || candidateProfile?.expectedSalary
          })
        });
      }
    } catch (e) {
      console.warn('Profile sync warning:', e);
    }

    setCurrentStep('answers_studio');
    generateAllAnswers();
  };

  // Generate Answer for a Question
  const generateAnswerForQuestion = async (idx: number) => {
    if (!applicationId) return;
    setGeneratingAnswerIdx(idx);

    try {
      const q = answers[idx].question;
      const res = await fetch(`/api/applications/${applicationId}/generate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate answer');

      const copy = [...answers];
      copy[idx] = {
        id: data.answer.id,
        question: q,
        answer: data.answer.answer,
        groundedFacts: data.answer.groundedFacts || [],
        status: 'DRAFT',
        isEditing: false
      };
      setAnswers(copy);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setGeneratingAnswerIdx(null);
    }
  };

  const generateAllAnswers = async () => {
    for (let i = 0; i < answers.length; i++) {
      if (!answers[i].answer) {
        await generateAnswerForQuestion(i);
      }
    }
  };

  // Final Verification Gate Submission & Automated Application Execution
  const handleFinalSubmit = async () => {
    if (!applicationId || !confirmedAuthCheckbox) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Execute Automated Application Service
      const res = await fetch(`/api/applications/${applicationId}/auto-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedAccuracyAndAuthorization: true,
          answers
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete automated submission');

      setAutomationReport(data.automation);
      setCurrentStep('submitted');
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '960px', paddingTop: '3rem' }}>
      {/* Step Progression Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        padding: '0.75rem 1.25rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: currentStep === 'input' || currentStep === 'analyzing' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700 }}>1</span>
          <span>Job Ingest</span>
        </div>
        <ArrowRight size={14} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: currentStep === 'match_overview' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700 }}>2</span>
          <span>Match & Gaps</span>
        </div>
        <ArrowRight size={14} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: currentStep === 'missing_info' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700 }}>3</span>
          <span>Clarification</span>
        </div>
        <ArrowRight size={14} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: currentStep === 'answers_studio' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700 }}>4</span>
          <span>Answers</span>
        </div>
        <ArrowRight size={14} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: currentStep === 'final_review' || currentStep === 'submitted' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700 }}>5</span>
          <span>Verification Gate</span>
        </div>
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

      {/* STEP 1: JOB INGESTION */}
      {currentStep === 'input' && (
        <div className="glass-panel" style={{ padding: '3rem 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <Send size={28} />
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Apply to a Job</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
              Paste any job posting or internship URL. The AI analyzes requirements, computes your qualification score, and helps you prepare an accurate application.
            </p>
          </div>

          <form onSubmit={handleAnalyzeJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Job Posting URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="e.g. https://boards.greenhouse.io/stripe/jobs/... or https://jobs.lever.co/..."
                style={{ fontSize: '1rem', padding: '0.9rem 1.25rem' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Supports Greenhouse, Lever, Ashby, Workday, LinkedIn, Indeed, and direct company career pages.
              </p>
            </div>

            {(showPasteText || !jobUrl) && (
              <div style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Paste Job Description Text
                  </label>
                  {jobUrl && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      URL Linked: {new URL(jobUrl.startsWith('http') ? jobUrl : 'https://' + jobUrl).hostname || 'Target Site'}
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={rawJobText}
                  onChange={(e) => setRawJobText(e.target.value)}
                  placeholder="Paste the full job description or requirements here if the target site blocks automated scrapers or requires a login..."
                  style={{ fontSize: '0.9rem' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Your application will remain linked to your target URL so the auto-apply engine can execute directly.
                </p>
              </div>
            )}

            {!showPasteText && (
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setShowPasteText(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  + Paste job description text instead
                </button>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <ShieldCheck size={16} color="var(--success)" />
              <span>
                Job descriptions are isolated within prompt-injection shields to ensure safe parsing.
              </span>
            </div>

            <button
              type="submit"
              disabled={!jobUrl.trim() && !rawJobText.trim()}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Sparkles size={18} />
              <span>Analyze Job & Check Match</span>
            </button>
          </form>
        </div>
      )}

      {/* ANALYZING SPINNER */}
      {currentStep === 'analyzing' && (
        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--accent-gradient-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            marginBottom: '1.5rem'
          }}>
            <RefreshCw size={32} className="animate-spin" />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Analyzing Job Posting</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Extracting requirements, parsing technical qualifications, and computing candidate compatibility...
          </p>
        </div>
      )}

      {/* STEP 2: MATCH OVERVIEW */}
      {currentStep === 'match_overview' && job && match && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Job Overview Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                  {job.employmentType || 'Internship'} • {job.remoteType || 'Role'}
                </span>
                <h1 style={{ fontSize: '1.85rem', color: '#fff', marginBottom: '0.25rem' }}>
                  {job.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={16} /> {job.company}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={16} /> {job.location || 'Location Not Specified'}
                  </span>
                  {job.salaryRange && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)' }}>
                      <DollarSign size={16} /> {job.salaryRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Score Display */}
              <div style={{
                textAlign: 'center',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: match.matchScore >= 75 ? 'var(--success-bg)' : match.matchScore >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)',
                border: `1px solid ${match.matchScore >= 75 ? 'rgba(16, 185, 129, 0.3)' : match.matchScore >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                minWidth: '150px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: match.matchScore >= 75 ? 'var(--success)' : match.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                  lineHeight: 1
                }}>
                  {match.matchScore}%
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
                  {match.qualificationStatus}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              {match.explanation}
            </p>
          </div>

          {/* Strengths and Potential Gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} />
                <span>Why You Match ({match.strengths.length})</span>
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {match.strengths.map((str, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: match.missingRequirements.length > 0 ? 'var(--warning)' : 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>Potential Gaps & Missing Skills ({match.missingRequirements.length})</span>
              </h3>
              {match.missingRequirements.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  No major missing technical requirements identified.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {match.missingRequirements.map((gap, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--warning)', flexShrink: 0 }}>•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button onClick={() => setCurrentStep('input')} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Job Input</span>
            </button>

            <button
              onClick={() => {
                if (missingInfo && missingInfo.length > 0) {
                  setCurrentStep('missing_info');
                } else {
                  setCurrentStep('answers_studio');
                  generateAllAnswers();
                }
              }}
              className="btn btn-primary btn-lg"
            >
              <span>{missingInfo.length > 0 ? 'Proceed to Clarifications' : 'Draft Application Answers'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MISSING INFORMATION DETECTIVE */}
      {currentStep === 'missing_info' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.25rem',
            background: 'var(--warning-bg)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem'
          }}>
            <HelpCircle size={24} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.25rem' }}>
                Application Requires Information Not Present in Your Profile
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Per our strict Zero-Hallucination policy, the AI will never guess or invent legal eligibility or compensation expectations. Please confirm these details:
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {missingInfo.map((item) => (
              <div key={item.key} style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)'
              }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {item.label}
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {item.reason}
                </p>

                {item.type === 'select' && item.options ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {item.options.map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={item.key}
                          value={opt}
                          checked={missingAnswers[item.key] === opt}
                          onChange={(e) => setMissingAnswers({ ...missingAnswers, [item.key]: e.target.value })}
                          style={{ width: 'auto' }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={missingAnswers[item.key] || ''}
                    onChange={(e) => setMissingAnswers({ ...missingAnswers, [item.key]: e.target.value })}
                    placeholder="Enter answer..."
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button onClick={() => setCurrentStep('match_overview')} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              onClick={handleSaveMissingInfo}
              className="btn btn-primary btn-lg"
            >
              <span>Confirm & Generate Answers</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: APPLICATION ANSWERS STUDIO */}
      {currentStep === 'answers_studio' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.25rem' }}>
                Application Question Answers
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Drafted exclusively using your confirmed profile facts. You can edit, regenerate, or accept each response.
              </p>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <ShieldCheck size={15} />
              <span>Grounded in Facts</span>
            </div>
          </div>

          {answers.map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', maxWidth: '75%' }}>
                  {item.question}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...answers];
                      copy[idx].isEditing = !copy[idx].isEditing;
                      setAnswers(copy);
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    <Edit2 size={13} />
                    <span>{item.isEditing ? 'Done' : 'Edit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAnswerForQuestion(idx)}
                    disabled={generatingAnswerIdx === idx}
                    className="btn btn-sm btn-outline"
                  >
                    <RefreshCw size={13} className={generatingAnswerIdx === idx ? 'animate-spin' : ''} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {item.isEditing ? (
                <textarea
                  rows={4}
                  value={item.answer}
                  onChange={(e) => {
                    const copy = [...answers];
                    copy[idx].answer = e.target.value;
                    setAnswers(copy);
                  }}
                  style={{ marginBottom: '1rem' }}
                />
              ) : (
                <div style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  {item.answer || (
                    <span style={{ color: 'var(--text-muted)' }}>
                      {generatingAnswerIdx === idx ? 'Drafting grounded response...' : 'No answer generated yet.'}
                    </span>
                  )}
                </div>
              )}

              {/* Grounded Facts Tags */}
              {item.groundedFacts && item.groundedFacts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Facts used:</span>
                  {item.groundedFacts.map((fact, fIdx) => (
                    <span
                      key={fIdx}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#6ee7b7'
                      }}
                    >
                      ✓ {fact}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button onClick={() => setCurrentStep('match_overview')} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep('final_review')}
              className="btn btn-primary btn-lg"
            >
              <span>Proceed to Final Verification Gate</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL VERIFICATION GATE */}
      {currentStep === 'final_review' && job && candidateProfile && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'rgba(236, 72, 153, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899',
              marginBottom: '1rem',
              border: '1px solid rgba(236, 72, 153, 0.3)'
            }}>
              <Lock size={28} />
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Final Verification Gate</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              Review the complete application payload before anything is submitted. Explicit user confirmation is strictly mandatory.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Applicant Summary */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Applicant Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {candidateProfile.fullName} ✓</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {candidateProfile.email} ✓</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {candidateProfile.phone || 'Not provided'} ✓</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> {candidateProfile.location || 'Not provided'} ✓</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Work Auth:</span> {missingAnswers['workAuthorization'] || candidateProfile.workAuthorization || 'Verified'} ✓</div>
              </div>
            </div>

            {/* Target Job */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>Role & Company</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                <strong>{job.title}</strong> at <strong>{job.company}</strong>
              </p>
            </div>

            {/* Answers Summary */}
            <div style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Application Answers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {answers.map((ans, i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--accent-primary)', paddingLeft: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem', color: '#fff' }}>
                      {ans.question}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {ans.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Explicit User Confirmation Gate */}
          <div style={{
            padding: '1.75rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              "Please carefully review this application. By continuing, you confirm that the information above is accurate and that you authorize the application to be submitted."
            </p>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={confirmedAuthCheckbox}
                onChange={(e) => setConfirmedAuthCheckbox(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', marginTop: '2px' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                I confirm that the information above is accurate and I authorize this application to be submitted.
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setCurrentStep('answers_studio')} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Edit Answers</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={!confirmedAuthCheckbox || submitting}
              className="btn btn-success btn-lg"
              style={{ minWidth: '240px' }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Applying Automatically...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Authorize & Apply For Me</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SUBMISSION SUCCESS & AUTOMATION REPORT */}
      {currentStep === 'submitted' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={42} />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Application Applied & Submitted!</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 1.5rem auto' }}>
            CareerOS has automated the application for <strong>{job?.title}</strong> at <strong>{job?.company}</strong> and logged it into your tracker.
          </p>

          {/* Automation Report Card */}
          {automationReport && (
            <div style={{
              maxWidth: '680px',
              margin: '0 auto 2rem auto',
              textAlign: 'left',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                  Automation Execution Summary
                </span>
                <span className={`badge ${automationReport.mode === 'DIRECT_DISPATCH' ? 'badge-success' : 'badge-info'}`}>
                  {automationReport.portalType} • {automationReport.fieldsFilledCount} Fields Populated
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {automationReport.instructions}
              </p>

              {/* Mapped fields overview */}
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Populated Application Fields:</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click any field to copy value</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
                  {automationReport.mappedFields?.map((f: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (f.mappedValue) {
                          navigator.clipboard.writeText(f.mappedValue);
                          setCopiedField(f.label);
                          setTimeout(() => setCopiedField(null), 2000);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                      title="Click to copy value"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                        <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
                        <span style={{ fontWeight: 600, flexShrink: 0, color: 'var(--text-primary)' }}>{f.label}:</span>
                        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.mappedValue}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: copiedField === f.label ? 'var(--success)' : 'var(--accent-primary)', flexShrink: 0, marginLeft: '0.5rem' }}>
                        {copiedField === f.label ? '✓ Copied' : 'Copy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Autofill Script or Direct Portal Action */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {job?.url && (
                  <button
                    type="button"
                    onClick={() => {
                      if (automationReport.autofillScript) {
                        navigator.clipboard.writeText(automationReport.autofillScript);
                        setCopiedScript(true);
                      }
                      window.open(job.url, '_blank');
                    }}
                    className="btn btn-sm btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>Launch Portal & Copy Autofill</span>
                    <ExternalLink size={14} />
                  </button>
                )}
                {job?.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>View Application Link</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                {automationReport.autofillScript && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(automationReport.autofillScript);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2500);
                    }}
                    className="btn btn-sm btn-outline"
                  >
                    {copiedScript ? '✓ Copied Autofill Script!' : 'Copy 1-Click Autofill Script'}
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/applications" className="btn btn-primary btn-lg">
              <span>View in Application Tracker</span>
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => {
                setCurrentStep('input');
                setJobUrl('');
                setRawJobText('');
                setConfirmedAuthCheckbox(false);
                setAutomationReport(null);
              }}
              className="btn btn-secondary btn-lg"
            >
              Apply to Another Role
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}><p>Loading...</p></div>}>
      <ApplyContent />
    </Suspense>
  );
}
