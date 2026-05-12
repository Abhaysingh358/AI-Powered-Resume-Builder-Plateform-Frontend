import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Sparkles, FileText, Target, Lightbulb,
  Languages, Wand2, Loader2, Lock, Copy, Check, Wrench,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useGenerateSummaryMutation,
  useGenerateBulletsMutation,
  useGenerateCoverLetterMutation,
  useImproveSectionMutation,
  useCheckAtsMutation,
  useSuggestSkillsMutation,
  useTranslateResumeMutation,
  useGetAiQuotaQuery,
} from '../../services/aiApi'
import { useGetMyResumesQuery } from '../../services/resumeApi'
import { selectIsPremium } from '../../features/auth/authSlice'
import { SECTION_TYPES } from '../../utils/constants'

function ResultBox({ content, isArray }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(isArray ? content.join('\n') : content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!content || (isArray && content.length === 0)) return null

  return (
    <div className="mt-4 bg-ink-50 rounded-xl p-4 relative">
      <button onClick={handleCopy} className="absolute top-3 right-3 btn-ghost p-1.5 text-xs gap-1">
        {copied ? <><Check size={12} className="text-success" /> Copied</> : <><Copy size={12} /> Copy</>}
      </button>
      {isArray ? (
        <ul className="space-y-1 pr-16">
          {content.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="text-accent mt-0.5 shrink-0">•</span> {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap pr-16">{content}</p>
      )}
    </div>
  )
}

function PremiumGate({ children, isPremium }) {
  return children
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export default function AiToolsPage() {
  const isPremium = useSelector(selectIsPremium)
  const { data: quotaData } = useGetAiQuotaQuery()
  const { data: resumesData } = useGetMyResumesQuery()

  const quota = quotaData?.data ?? quotaData?.Data
  const resumes = resumesData?.data ?? resumesData?.Data ?? []

  const [generateSummary, { isLoading: summaryLoading }] = useGenerateSummaryMutation()
  const [generateBullets, { isLoading: bulletsLoading }] = useGenerateBulletsMutation()
  const [generateCoverLetter, { isLoading: coverLoading }] = useGenerateCoverLetterMutation()
  const [improveSection, { isLoading: improveLoading }] = useImproveSectionMutation()
  const [checkAts, { isLoading: atsLoading }] = useCheckAtsMutation()
  const [suggestSkills, { isLoading: skillsLoading }] = useSuggestSkillsMutation()
  const [translateResume, { isLoading: translateLoading }] = useTranslateResumeMutation()

  const [results, setResults] = useState({})

  // Generate Summary 
  // POST /api/ai/generate-summary
  // Required: ResumeId (int), JobTitle (string), KeySkills (string)
  // Optional: YearsExperience (int)
  const [summaryForm, setSummaryForm] = useState({
    ResumeId: '', JobTitle: '', KeySkills: '', YearsExperience: 0,
  })
  const handleSummary = async () => {
    const resumeId = parseInt(summaryForm.ResumeId);
    if (isNaN(resumeId)) return toast.error('Please select a valid resume.')
    if (!summaryForm.JobTitle || !summaryForm.KeySkills)
      return toast.error('Job Title and Key Skills are required.')
    try {
      const res = await generateSummary({
        ...summaryForm,
        ResumeId: resumeId,
      }).unwrap()
      setResults(p => ({ ...p, summary: res.data ?? res.Data }))
    } catch (err) { toast.error(err?.data?.message ?? err?.data?.Message ?? 'Failed.') }
  }

  // Generate Bullets
  // POST /api/ai/generate-bullets
  // Required: ResumeId (int), JobTitle (string), Responsibilities (string)
  // Optional: CompanyName (string)
  const [bulletsForm, setBulletsForm] = useState({
    ResumeId: '', JobTitle: '', Responsibilities: '', CompanyName: '',
  })
  const handleBullets = async () => {
    if (!bulletsForm.ResumeId || !bulletsForm.JobTitle || !bulletsForm.Responsibilities)
      return toast.error('Resume ID, Job Title and Responsibilities are required.')
    try {
      const res = await generateBullets({
        ...bulletsForm,
        ResumeId: parseInt(bulletsForm.ResumeId),
      }).unwrap()
      setResults(p => ({ ...p, bullets: res.data ?? res.Data }))
    } catch (err) { toast.error(err?.data?.message ?? err?.data?.Message ?? 'Failed.') }
  }

  // ATS Check
  // POST /api/ai/check-ats
  // Required: ResumeId (int), ResumeText (string), JobDescription (string)
  const [atsForm, setAtsForm] = useState({
    ResumeId: '', ResumeText: '', JobDescription: '',
  })
  const handleAts = async () => {
    if (!atsForm.ResumeId || !atsForm.ResumeText || !atsForm.JobDescription)
      return toast.error('Resume ID, Resume Text and Job Description are required.')
    try {
      const res = await checkAts({
        ...atsForm,
        ResumeId: parseInt(atsForm.ResumeId),
      }).unwrap()
      setResults(p => ({ ...p, ats: res.data ?? res.Data }))
    } catch (err) { toast.error(err?.data?.message ?? err?.data?.Message ?? 'Failed.') }
  }

  // Suggest Skills
  // POST /api/ai/suggest-skills
  // Required: ResumeId (int), JobTitle (string)
  const [skillsForm, setSkillsForm] = useState({ ResumeId: '', JobTitle: '' })
  const handleSkills = async () => {
    if (!skillsForm.ResumeId || !skillsForm.JobTitle)
      return toast.error('Resume ID and Job Title are required.')
    try {
      const res = await suggestSkills({
        ...skillsForm,
        ResumeId: parseInt(skillsForm.ResumeId),
      }).unwrap()
      setResults(p => ({ ...p, skills: res.data ?? res.Data }))
    } catch (err) { toast.error(err?.data?.message ?? err?.data?.Message ?? 'Failed.') }
  }

  // Cover Letter (Premium)
  // POST /api/ai/generate-cover-letter
  // Required: ResumeId (int), JobDescription (string), ApplicantName (string)
  // Optional: CompanyName (string)
  const [coverForm, setCoverForm] = useState({
    ResumeId: '', JobDescription: '', ApplicantName: '', CompanyName: '',
  })
  const handleCover = async () => {
    if (!coverForm.ResumeId || !coverForm.JobDescription || !coverForm.ApplicantName)
      return toast.error('Resume ID, Job Description and Applicant Name are required.')
    try {
      const res = await generateCoverLetter({
        ...coverForm,
        ResumeId: parseInt(coverForm.ResumeId),
      }).unwrap()
      setResults(p => ({ ...p, cover: res.data ?? res.Data }))
    } catch (err) { toast.error(err?.data?.message ?? err?.data?.Message ?? 'Failed.') }
  }

  // Improve Section (Premium)
  // POST /api/ai/improve-section
  // Required: ResumeId (int), SectionType (string), CurrentContent (string)
  const [improveForm, setImproveForm] = useState({
    ResumeId: '', SectionType: 'SUMMARY', CurrentContent: '',
  })
  const handleImprove = async () => {
    if (!improveForm.ResumeId || !improveForm.CurrentContent)
      return toast.error('Resume ID and Current Content are required.')
    try {
      const res = await improveSection({
        ...improveForm,
        ResumeId: parseInt(improveForm.ResumeId),
      }).unwrap()
      setResults(p => ({ ...p, improve: res.data ?? res.Data }))
    } catch (err) { toast.error(err?.data?.message ?? err?.data?.Message ?? 'Failed.') }
  }

  // Translate Resume (Premium)
  // POST /api/ai/translate
  // Required: ResumeId (int), ResumeContent (string), TargetLanguage (string)
  const [translateForm, setTranslateForm] = useState({
    ResumeId: '', ResumeContent: '', TargetLanguage: '',
  })
  const handleTranslate = async () => {
    if (!translateForm.ResumeId || !translateForm.ResumeContent || !translateForm.TargetLanguage)
      return toast.error('All fields are required.')
    try {
      const res = await translateResume({
        ...translateForm,
        ResumeId: parseInt(translateForm.ResumeId),
      }).unwrap()
      setResults(p => ({ ...p, translate: res.data ?? res.Data }))
    } catch (err) { toast.error(err?.data?.message ?? err?.data?.Message ?? 'Failed.') }
  }

  const resumeIdInput = (value, onChange, onSelectResume) => (
    <Field label="Select Resume *">
      <select className="input" value={value} onChange={e => {
        const id = e.target.value;
        onChange(id);
        if (onSelectResume) {
          const selected = resumes.find(r => (r.resumeId ?? r.id ?? r.ResumeId) == id);
          onSelectResume(selected);
        }
      }}>
        <option value="">-- Select a Resume --</option>
        {resumes.map(r => {
          const id = r.resumeId ?? r.id ?? r.ResumeId;
          const title = r.title ?? r.Title ?? `Resume #${id}`;
          return (
            <option key={id} value={id}>
              {title}
            </option>
          );
        })}
      </select>
    </Field>
  )

  const runBtn = (onClick, isLoading, icon, label) => (
    <button onClick={onClick} disabled={isLoading} className="btn-primary w-full">
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {isLoading ? 'Working…' : label}
    </button>
  )

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">AI Tools</h1>
          <p className="page-subtitle">Supercharge your resume with artificial intelligence.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Generate Summary ── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm">Generate Summary</h3>
              <p className="text-xs text-ink-400">Professional summary from job title + skills</p>
            </div>
          </div>
          <div className="space-y-3">
            {resumeIdInput(
              summaryForm.ResumeId,
              v => setSummaryForm(p => ({ ...p, ResumeId: v })),
              resume => {
                if (resume) {
                  setSummaryForm(p => ({
                    ...p,
                    JobTitle: resume.targetJobTitle ?? resume.TargetJobTitle ?? p.JobTitle
                  }))
                }
              }
            )}
            <Field label="Job Title *">
              <input className="input" placeholder="e.g. Senior Software Engineer"
                value={summaryForm.JobTitle}
                onChange={e => setSummaryForm(p => ({ ...p, JobTitle: e.target.value }))} />
            </Field>
            <Field label="Key Skills *">
              <input className="input" placeholder="e.g. React, Node.js, PostgreSQL"
                value={summaryForm.KeySkills}
                onChange={e => setSummaryForm(p => ({ ...p, KeySkills: e.target.value }))} />
            </Field>
            <Field label="Years of Experience">
              <input type="number" className="input" placeholder="0"
                value={summaryForm.YearsExperience}
                onChange={e => setSummaryForm(p => ({ ...p, YearsExperience: +e.target.value }))} />
            </Field>
            {runBtn(handleSummary, summaryLoading, <Sparkles size={14} />, 'Generate Summary')}
            <ResultBox content={results.summary} />
          </div>
        </div>

        {/* ── Generate Bullets ── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
              <FileText size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm">Generate Bullets</h3>
              <p className="text-xs text-ink-400">Impactful bullet points for work experience</p>
            </div>
          </div>
          <div className="space-y-3">
            {resumeIdInput(
              bulletsForm.ResumeId,
              v => setBulletsForm(p => ({ ...p, ResumeId: v })),
              resume => {
                if (resume) {
                  setBulletsForm(p => ({
                    ...p,
                    JobTitle: resume.targetJobTitle ?? resume.TargetJobTitle ?? p.JobTitle
                  }))
                }
              }
            )}
            <Field label="Job Title *">
              <input className="input" placeholder="e.g. Frontend Developer"
                value={bulletsForm.JobTitle}
                onChange={e => setBulletsForm(p => ({ ...p, JobTitle: e.target.value }))} />
            </Field>
            <Field label="Company Name">
              <input className="input" placeholder="e.g. Google (optional)"
                value={bulletsForm.CompanyName}
                onChange={e => setBulletsForm(p => ({ ...p, CompanyName: e.target.value }))} />
            </Field>
            <Field label="Responsibilities *">
              <textarea className="input resize-none" rows={3}
                placeholder="Describe what you did in this role…"
                value={bulletsForm.Responsibilities}
                onChange={e => setBulletsForm(p => ({ ...p, Responsibilities: e.target.value }))} />
            </Field>
            {runBtn(handleBullets, bulletsLoading, <FileText size={14} />, 'Generate Bullets')}
            <ResultBox content={results.bullets} isArray />
          </div>
        </div>

        {/* ── ATS Check ── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
              <Target size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm">ATS Check</h3>
              <p className="text-xs text-ink-400">Score your resume against a job description (0–100)</p>
            </div>
          </div>
          <div className="space-y-3">
            {resumeIdInput(atsForm.ResumeId, v => setAtsForm(p => ({ ...p, ResumeId: v })))}
            <Field label="Resume Text *">
              <textarea className="input resize-none" rows={3}
                placeholder="Paste your resume text here…"
                value={atsForm.ResumeText}
                onChange={e => setAtsForm(p => ({ ...p, ResumeText: e.target.value }))} />
            </Field>
            <Field label="Job Description *">
              <textarea className="input resize-none" rows={3}
                placeholder="Paste the job description here…"
                value={atsForm.JobDescription}
                onChange={e => setAtsForm(p => ({ ...p, JobDescription: e.target.value }))} />
            </Field>
            {runBtn(handleAts, atsLoading, <Target size={14} />, 'Run ATS Check')}
            {results.ats && (
              <div className="mt-3 bg-ink-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ink">ATS Score</span>
                  <span className="font-display text-2xl font-bold text-ink">
                    {results.ats.Score ?? results.ats.score}
                    <span className="text-ink-300 text-sm">/100</span>
                  </span>
                </div>
                <div className="quota-bar mb-3">
                  <div
                    className={`quota-fill ${(results.ats.Score ?? results.ats.score) >= 80 ? 'bg-success' : (results.ats.Score ?? results.ats.score) >= 60 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${results.ats.Score ?? results.ats.score}%` }}
                  />
                </div>
                {(results.ats.Suggestions ?? results.ats.suggestions)?.map((s, i) => (
                  <p key={i} className="text-xs text-ink-400 flex gap-2"><span className="text-ink-300">→</span>{s}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Suggest Skills ── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
              <Lightbulb size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm">Suggest Skills</h3>
              <p className="text-xs text-ink-400">AI-suggested skills for your target job</p>
            </div>
          </div>
          <div className="space-y-3">
            {resumeIdInput(
              skillsForm.ResumeId,
              v => setSkillsForm(p => ({ ...p, ResumeId: v })),
              resume => {
                if (resume) {
                  setSkillsForm(p => ({
                    ...p,
                    JobTitle: resume.targetJobTitle ?? resume.TargetJobTitle ?? p.JobTitle
                  }))
                }
              }
            )}
            <Field label="Job Title *">
              <input className="input" placeholder="e.g. Data Scientist"
                value={skillsForm.JobTitle}
                onChange={e => setSkillsForm(p => ({ ...p, JobTitle: e.target.value }))} />
            </Field>
            {runBtn(handleSkills, skillsLoading, <Lightbulb size={14} />, 'Suggest Skills')}
            <ResultBox content={results.skills} isArray />
          </div>
        </div>

        {/* ── Cover Letter (Premium) ── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
              <Wand2 size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
                Cover Letter

              </h3>
              <p className="text-xs text-ink-400">Personalized cover letter for a job posting</p>
            </div>
          </div>
          <PremiumGate isPremium={isPremium}>
            <div className="space-y-3">
              {resumeIdInput(coverForm.ResumeId, v => setCoverForm(p => ({ ...p, ResumeId: v })))}
              <Field label="Applicant Name *">
                <input className="input" placeholder="e.g. John Smith"
                  value={coverForm.ApplicantName}
                  onChange={e => setCoverForm(p => ({ ...p, ApplicantName: e.target.value }))} />
              </Field>
              <Field label="Company Name">
                <input className="input" placeholder="e.g. Google (optional)"
                  value={coverForm.CompanyName}
                  onChange={e => setCoverForm(p => ({ ...p, CompanyName: e.target.value }))} />
              </Field>
              <Field label="Job Description *">
                <textarea className="input resize-none" rows={3}
                  placeholder="Paste the job description…"
                  value={coverForm.JobDescription}
                  onChange={e => setCoverForm(p => ({ ...p, JobDescription: e.target.value }))} />
              </Field>
              {runBtn(handleCover, coverLoading, <Wand2 size={14} />, 'Generate Cover Letter')}
              <ResultBox content={results.cover} />
            </div>
          </PremiumGate>
        </div>

        {/* ── Improve Section (Premium) ── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
              <Wrench size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
                Improve Section

              </h3>
              <p className="text-xs text-ink-400">Rewrite any section for more impact</p>
            </div>
          </div>
          <PremiumGate isPremium={isPremium}>
            <div className="space-y-3">
              {resumeIdInput(improveForm.ResumeId, v => setImproveForm(p => ({ ...p, ResumeId: v })))}
              <Field label="Section Type *">
                <select className="input" value={improveForm.SectionType}
                  onChange={e => setImproveForm(p => ({ ...p, SectionType: e.target.value }))}>
                  {SECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Current Content *">
                <textarea className="input resize-none" rows={4}
                  placeholder="Paste the current section content…"
                  value={improveForm.CurrentContent}
                  onChange={e => setImproveForm(p => ({ ...p, CurrentContent: e.target.value }))} />
              </Field>
              {runBtn(handleImprove, improveLoading, <Wrench size={14} />, 'Improve Section')}
              <ResultBox content={results.improve} />
            </div>
          </PremiumGate>
        </div>

        {/* ── Translate Resume (Premium) ── */}
        <div className="card p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center">
              <Languages size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
                Translate Resume

              </h3>
              <p className="text-xs text-ink-400">Translate your full resume into another language</p>
            </div>
          </div>
          <PremiumGate isPremium={isPremium}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-3">
                {resumeIdInput(translateForm.ResumeId, v => setTranslateForm(p => ({ ...p, ResumeId: v })))}
                <Field label="Target Language *">
                  <input className="input" placeholder="e.g. French, Spanish, German"
                    value={translateForm.TargetLanguage}
                    onChange={e => setTranslateForm(p => ({ ...p, TargetLanguage: e.target.value }))} />
                </Field>
              </div>
              <div className="md:col-span-2 space-y-3">
                <Field label="Resume Content *">
                  <textarea className="input resize-none" rows={4}
                    placeholder="Paste your full resume text here…"
                    value={translateForm.ResumeContent}
                    onChange={e => setTranslateForm(p => ({ ...p, ResumeContent: e.target.value }))} />
                </Field>
                {runBtn(handleTranslate, translateLoading, <Languages size={14} />, 'Translate Resume')}
              </div>
            </div>
            <ResultBox content={results.translate} />
          </PremiumGate>
        </div>

      </div>
    </div>
  )
}