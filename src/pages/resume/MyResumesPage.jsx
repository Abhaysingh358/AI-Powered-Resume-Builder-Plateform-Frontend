import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, MoreVertical, Copy, Trash2,
  Globe, EyeOff, Edit3, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useGetMyResumesQuery,
  useCreateResumeMutation,
  useDeleteResumeMutation,
  useDuplicateResumeMutation,
  usePublishResumeMutation,
  useUnpublishResumeMutation,
} from '../../services/resumeApi'
import { useGetAllTemplatesQuery } from '../../services/templateApi'

// Normalize PascalCase or camelCase from backend
const normalizeResume = (r) => ({
  resumeId:      r.ResumeId      ?? r.resumeId,
  title:         r.Title         ?? r.title         ?? 'Untitled Resume',
  targetJobTitle:r.TargetJobTitle?? r.targetJobTitle ?? '',
  isPublic:      r.IsPublic      ?? r.isPublic       ?? false,
  atsScore:      r.AtsScore      ?? r.atsScore       ?? 0,
  language:      r.Language      ?? r.language       ?? 'en',
  status:        r.Status        ?? r.status         ?? 'DRAFT',
})

const normalizeTemplate = (t) => ({
  templateId: t.TemplateId ?? t.templateId,
  name:       t.Name       ?? t.name,
  isPremium:  t.IsPremium  ?? t.isPremium ?? t.tier === 'PREMIUM',
  category:   t.Category   ?? t.category,
})

function ResumeCard({ resume, onEdit, onDelete, onDuplicate, onPublish, onUnpublish }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-accent" />
        </div>
        <div className="relative">
          <button onClick={() => setOpen(p => !p)} className="btn-ghost w-8 h-8 p-0 rounded-lg">
            <MoreVertical size={15} />
          </button>
          {open && (
            <div className="absolute right-0 top-9 z-20 bg-white border border-ink-100 rounded-xl shadow-float w-44 py-1 animate-slide-up">
              {[
                { icon: Edit3,  label: 'Edit',      action: onEdit,      cls: '' },
                { icon: Copy,   label: 'Duplicate', action: onDuplicate, cls: '' },
                resume.isPublic
                  ? { icon: EyeOff, label: 'Unpublish', action: onUnpublish, cls: '' }
                  : { icon: Globe,  label: 'Publish',   action: onPublish,   cls: '' },
                { icon: Trash2, label: 'Delete',    action: onDelete,    cls: 'text-danger' },
              ].map(({ icon: Icon, label, action, cls }) => (
                <button key={label} onClick={() => { action(); setOpen(false) }}
                  className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm hover:bg-ink-50 transition-colors ${cls}`}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-ink truncate">{resume.title}</h3>
      <p className="text-xs text-ink-400 mt-0.5 truncate">{resume.targetJobTitle || 'No target job title'}</p>

      <div className="flex items-center gap-2 mt-3">
        <span className={resume.isPublic ? 'badge-published' : 'badge-draft'}>
          {resume.isPublic ? 'Published' : 'Draft'}
        </span>
        {resume.language && resume.language !== 'en' && (
          <span className="badge bg-info/10 text-info">{resume.language}</span>
        )}
      </div>

      {resume.atsScore > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ink-400">ATS Score</span>
            <span className="font-mono font-medium text-ink">{resume.atsScore}%</span>
          </div>
          <div className="quota-bar">
            <div
              className={`quota-fill ${resume.atsScore >= 80 ? 'bg-success' : resume.atsScore >= 60 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${resume.atsScore}%` }}
            />
          </div>
        </div>
      )}

      <button onClick={onEdit} className="mt-4 btn-primary w-full text-sm py-2">
        <Edit3 size={13} /> Edit resume
      </button>
    </div>
  )
}

export default function MyResumesPage() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate]         = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [title, setTitle]                   = useState('')
  const [jobTitle, setJobTitle]             = useState('')

  const { data: resumesData, isLoading }    = useGetMyResumesQuery()
  const { data: templatesData }             = useGetAllTemplatesQuery()
  const [createResume, { isLoading: creating }] = useCreateResumeMutation()
  const [deleteResume]    = useDeleteResumeMutation()
  const [duplicateResume] = useDuplicateResumeMutation()
  const [publishResume]   = usePublishResumeMutation()
  const [unpublishResume] = useUnpublishResumeMutation()

  const resumes   = (resumesData?.data   || resumesData?.Data   || []).map(normalizeResume)
  const templates = (templatesData?.data || templatesData?.Data || []).map(normalizeTemplate)

  const handleCreate = async () => {
    if (!selectedTemplate) return toast.error('Please select a template.')
    if (!title.trim())     return toast.error('Please enter a resume title.')
    try {
      const res = await createResume({ templateId: selectedTemplate, title, targetJobTitle: jobTitle }).unwrap()
      const resumeId = res.data?.ResumeId ?? res.data?.resumeId ?? res.Data?.ResumeId
      toast.success('Resume created!')
      setShowCreate(false)
      setTitle('')
      setJobTitle('')
      setSelectedTemplate(null)
      navigate(`/resumes/${resumeId}/edit`)
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.Message || 'Failed to create resume.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return
    try { await deleteResume(id).unwrap(); toast.success('Deleted.') }
    catch { toast.error('Failed to delete.') }
  }

  const handleDuplicate = async (id) => {
    try { await duplicateResume(id).unwrap(); toast.success('Duplicated!') }
    catch (err) { toast.error(err?.data?.message || 'Failed to duplicate.') }
  }

  const handlePublish = async (id) => {
    try { await publishResume(id).unwrap(); toast.success('Published to gallery!') }
    catch { toast.error('Failed to publish.') }
  }

  const handleUnpublish = async (id) => {
    try { await unpublishResume(id).unwrap(); toast.success('Removed from gallery.') }
    catch { toast.error('Failed to unpublish.') }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">My Resumes</h1>
          <p className="page-subtitle">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={15} /> New Resume
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-52" />)}
        </div>
      )}

      {!isLoading && resumes.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 bg-ink-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <FileText size={24} className="text-ink-300" />
          </div>
          <h3 className="font-display font-semibold text-ink">No resumes yet</h3>
          <p className="text-sm text-ink-400 mt-2 mb-6">Create your first resume and start applying.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={15} /> Create resume
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map(r => (
          <ResumeCard
            key={r.resumeId}
            resume={r}
            onEdit={()      => navigate(`/resumes/${r.resumeId}/edit`)}
            onDelete={()    => handleDelete(r.resumeId)}
            onDuplicate={() => handleDuplicate(r.resumeId)}
            onPublish={()   => handlePublish(r.resumeId)}
            onUnpublish={() => handleUnpublish(r.resumeId)}
          />
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-float w-full max-w-lg animate-slide-up">
            <div className="p-6 border-b border-ink-100">
              <h2 className="font-display font-bold text-xl text-ink">Create new resume</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Resume title *</label>
                <input className="input" placeholder="e.g. Software Engineer Resume"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Target job title</label>
                <input className="input" placeholder="e.g. Senior Frontend Developer"
                  value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Choose template *</label>
                {templates.length === 0 ? (
                  <p className="text-xs text-ink-400 py-4 text-center">No templates available. Add templates via the Template API.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {templates.map(t => (
                      <button
                        key={t.templateId}
                        onClick={() => setSelectedTemplate(t.templateId)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedTemplate === t.templateId
                            ? 'border-ink bg-ink text-white'
                            : 'border-ink-100 hover:border-ink-300'
                        }`}
                      >
                        <div className="text-xs font-medium truncate">{t.name}</div>
                        <div className={`text-[10px] mt-0.5 ${selectedTemplate === t.templateId ? 'text-accent' : 'text-ink-400'}`}>
                          {t.isPremium ? 'Premium' : 'Free'} · {t.category?.replace('_', ' ')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-ink-100 flex gap-3 justify-end">
              <button onClick={() => { setShowCreate(false); setSelectedTemplate(null) }} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {creating ? 'Creating…' : 'Create resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}