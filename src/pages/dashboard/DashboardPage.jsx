import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FileText, Sparkles, Download, Layout, ArrowRight, Plus, TrendingUp } from 'lucide-react'
import { selectCurrentUser, selectIsPremium } from '../../features/auth/authSlice'
import { useGetMyResumesQuery } from '../../services/resumeApi'
import { useGetAiQuotaQuery }   from '../../services/aiApi'
import { useGetExportStatsQuery } from '../../services/exportApi'

function StatCard({ label, value, icon: Icon, color = 'bg-ink-50', onClick }) {
  return (
    <button
      onClick={onClick}
      className="card p-6 text-left hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200 w-full"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon size={18} className="text-ink" />
      </div>
      <div className="font-display text-3xl font-bold text-ink">{value ?? '—'}</div>
      <div className="text-sm text-ink-400 mt-1">{label}</div>
    </button>
  )
}

function QuickAction({ label, desc, icon: Icon, to, accent }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className={`card-hover p-5 text-left flex items-center gap-4 w-full ${accent ? 'border-accent bg-accent/5' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-ink' : 'bg-ink-50'}`}>
        <Icon size={16} className={accent ? 'text-accent' : 'text-ink'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink text-sm">{label}</div>
        <div className="text-xs text-ink-400 mt-0.5">{desc}</div>
      </div>
      <ArrowRight size={14} className="text-ink-300 shrink-0" />
    </button>
  )
}

export default function DashboardPage() {
  const navigate  = useNavigate()
  const user      = useSelector(selectCurrentUser)
  const isPremium = useSelector(selectIsPremium)

  const { data: resumesData }  = useGetMyResumesQuery()
  const { data: quotaData }    = useGetAiQuotaQuery()
  const { data: exportData }   = useGetExportStatsQuery()

  const resumes     = resumesData?.data || []
  const quota       = quotaData?.data
  const exportStats = exportData?.data

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <p className="text-ink-400 text-sm">{greeting} 👋</p>
          <h1 className="page-title mt-1">{user?.fullName?.split(' ')[0] || 'User'}'s workspace</h1>
        </div>
        <button onClick={() => navigate('/resumes')} className="btn-primary gap-2">
          <Plus size={15} /> New Resume
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total resumes"
          value={resumes.length}
          icon={FileText}
          onClick={() => navigate('/resumes')}
        />
        <StatCard
          label={isPremium ? 'AI calls (unlimited)' : `AI calls left`}
          value={isPremium ? '∞' : (quota?.aiCallsRemaining ?? '—')}
          icon={Sparkles}
          color="bg-accent/20"
          onClick={() => navigate('/ai')}
        />
        <StatCard
          label="Exports today"
          value={exportStats?.exportsToday ?? 0}
          icon={Download}
          onClick={() => navigate('/export')}
        />
        <StatCard
          label="Published resumes"
          value={resumes.filter(r => r.isPublic).length}
          icon={TrendingUp}
          onClick={() => navigate('/resumes')}
        />
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-lg text-ink mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <QuickAction accent label="Create a new resume"     desc="Start from a template"          icon={Plus}     to="/resumes" />
          <QuickAction        label="Browse templates"        desc="50+ professional designs"        icon={Layout}   to="/templates" />
          <QuickAction        label="Run AI tools"            desc="Summaries, bullets, ATS check"  icon={Sparkles} to="/ai" />
          <QuickAction        label="Export your resume"      desc="PDF, DOCX, or JSON"             icon={Download} to="/export" />
        </div>
      </div>

      {/* Recent resumes */}
      {resumes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-ink">Recent resumes</h2>
            <button onClick={() => navigate('/resumes')} className="btn-ghost text-xs gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.slice(0, 3).map(r => (
              <div key={r.resumeId} className="card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-ink-50 rounded-lg flex items-center justify-center">
                    <FileText size={15} className="text-ink-400" />
                  </div>
                  <span className={r.isPublic ? 'badge-published' : 'badge-draft'}>
                    {r.isPublic ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-semibold text-ink text-sm truncate">{r.title || 'Untitled Resume'}</h3>
                <p className="text-xs text-ink-400 mt-0.5 truncate">{r.targetJobTitle || 'No job title'}</p>
                {r.atsScore > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="quota-bar flex-1">
                      <div className="quota-fill" style={{ width: `${r.atsScore}%` }} />
                    </div>
                    <span className="text-xs font-mono text-ink-400">{r.atsScore}%</span>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/resumes/${r.resumeId}/edit`)}
                  className="mt-4 btn-outline w-full text-xs py-1.5"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {resumes.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-ink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-ink-300" />
          </div>
          <h3 className="font-display font-semibold text-ink">No resumes yet</h3>
          <p className="text-ink-400 text-sm mt-2 mb-6">Create your first resume to get started.</p>
          <button onClick={() => navigate('/resumes')} className="btn-primary">
            <Plus size={15} /> Create resume
          </button>
        </div>
      )}
    </div>
  )
}
