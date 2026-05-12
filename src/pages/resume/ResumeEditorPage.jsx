import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus, Save, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  Loader2, ArrowLeft, Sparkles, GripVertical,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetResumeByIdQuery, useUpdateResumeMutation } from '../../services/resumeApi'
import {
  useGetSectionsByResumeQuery,
  useAddSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useToggleVisibilityMutation,
  useReorderSectionsMutation,
} from '../../services/sectionApi'
import { SECTION_TYPES } from '../../utils/constants'

function SectionCard({ section, onUpdate, onDelete, onToggle, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true)
  const [content, setContent]   = useState(section.content || '')
  const [dirty, setDirty]       = useState(false)

  const handleSave = () => { onUpdate({ content }); setDirty(false) }

  return (
    <div className={`card mb-3 overflow-hidden ${!section.isVisible ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3 p-4 border-b border-ink-100">
        <GripVertical size={14} className="text-ink-200 cursor-grab shrink-0" />
        <div className="flex-1">
          <span className="font-semibold text-sm text-ink">{section.title || section.sectionType}</span>
          <span className="ml-2 badge bg-ink-100 text-ink-400 text-[10px]">{section.sectionType}</span>
          {section.aiGenerated && (
            <span className="ml-1 badge bg-accent/20 text-ink text-[10px]">
              <Sparkles size={9} /> AI
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp}   disabled={isFirst} className="btn-ghost w-7 h-7 p-0 disabled:opacity-20"><ChevronUp size={14} /></button>
          <button onClick={onMoveDown} disabled={isLast}  className="btn-ghost w-7 h-7 p-0 disabled:opacity-20"><ChevronDown size={14} /></button>
          <button onClick={onToggle}   className="btn-ghost w-7 h-7 p-0">
            {section.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={onDelete}   className="btn-ghost w-7 h-7 p-0 text-danger hover:bg-danger/10"><Trash2 size={14} /></button>
          <button onClick={() => setExpanded(p => !p)} className="btn-ghost w-7 h-7 p-0">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          <textarea
            rows={5}
            className="input resize-none font-mono text-xs"
            value={content}
            onChange={e => { setContent(e.target.value); setDirty(true) }}
            placeholder="Section content…"
          />
          {dirty && (
            <button onClick={handleSave} className="btn-primary mt-2 text-xs py-1.5">
              <Save size={12} /> Save
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResumeEditorPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const resumeId   = parseInt(id)

  const { data: resumeData, isLoading: loadingResume } = useGetResumeByIdQuery(resumeId)
  const { data: sectionsData, isLoading: loadingSections } = useGetSectionsByResumeQuery(resumeId)

  const [updateResume]      = useUpdateResumeMutation()
  const [addSection]        = useAddSectionMutation()
  const [updateSection]     = useUpdateSectionMutation()
  const [deleteSection]     = useDeleteSectionMutation()
  const [toggleVisibility]  = useToggleVisibilityMutation()
  const [reorderSections]   = useReorderSectionsMutation()

  const resume   = resumeData?.data
  const sections = sectionsData?.data || []

  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionType, setNewSectionType] = useState('SUMMARY')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)

  const handleAddSection = async () => {
    try {
      await addSection({
        resumeId,
        sectionType:  newSectionType,
        title:        newSectionTitle || newSectionType,
        displayOrder: sections.length,
      }).unwrap()
      toast.success('Section added!')
      setShowAddSection(false)
      setNewSectionTitle('')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add section.')
    }
  }

  const handleUpdateSection = async (sectionId, data) => {
    try {
      await updateSection({ sectionId, ...data }).unwrap()
      toast.success('Saved.')
    } catch { toast.error('Save failed.') }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this section?')) return
    try { await deleteSection(sectionId).unwrap(); toast.success('Deleted.') }
    catch { toast.error('Delete failed.') }
  }

  const handleMove = async (index, dir) => {
    const newOrder = [...sections]
    const target   = index + dir
    if (target < 0 || target >= newOrder.length) return
    ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
    try {
      await reorderSections({
        resumeId,
        orderedSectionIds: newOrder.map(s => s.sectionId),
      }).unwrap()
    } catch { toast.error('Reorder failed.') }
  }

  const handleSaveTitle = async () => {
    try {
      await updateResume({ resumeId, title: editTitle }).unwrap()
      toast.success('Title updated.')
      setEditingTitle(false)
    } catch { toast.error('Failed.') }
  }

  if (loadingResume || loadingSections) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-ink-300" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/resumes')} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                className="input text-xl font-display font-bold py-1 w-64"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                autoFocus
              />
              <button onClick={handleSaveTitle} className="btn-primary text-xs py-1.5"><Save size={12} /> Save</button>
              <button onClick={() => setEditingTitle(false)} className="btn-ghost text-xs">Cancel</button>
            </div>
          ) : (
            <h1
              className="page-title cursor-pointer hover:text-ink-500 transition-colors"
              onClick={() => { setEditTitle(resume?.title || ''); setEditingTitle(true) }}
            >
              {resume?.title || 'Untitled Resume'}
              <span className="text-ink-300 text-sm font-body ml-2">(click to edit)</span>
            </h1>
          )}
          <p className="page-subtitle">{resume?.targetJobTitle || 'No target job title'}</p>
        </div>
        <button onClick={() => navigate('/ai')} className="btn-outline gap-2 text-sm">
          <Sparkles size={14} /> AI Tools
        </button>
      </div>

      {/* Sections */}
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink">Sections ({sections.length})</h2>
            <button onClick={() => setShowAddSection(true)} className="btn-primary text-sm">
              <Plus size={14} /> Add section
            </button>
          </div>

          {sections.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-ink-400">No sections yet. Add your first section above.</p>
            </div>
          )}

          {sections.map((section, i) => (
            <SectionCard
              key={section.sectionId}
              section={section}
              isFirst={i === 0}
              isLast={i === sections.length - 1}
              onUpdate={(data) => handleUpdateSection(section.sectionId, data)}
              onDelete={() => handleDeleteSection(section.sectionId)}
              onToggle={() => toggleVisibility(section.sectionId)}
              onMoveUp={()   => handleMove(i, -1)}
              onMoveDown={()  => handleMove(i,  1)}
            />
          ))}
        </div>

        {/* Sidebar info */}
        <div className="w-56 shrink-0">
          <div className="card p-4 sticky top-0">
            <h3 className="font-semibold text-sm text-ink mb-3">Resume info</h3>
            <div className="space-y-2 text-xs text-ink-400">
              <div className="flex justify-between">
                <span>Status</span>
                <span className={resume?.isPublic ? 'badge-published' : 'badge-draft'}>
                  {resume?.isPublic ? 'Published' : 'Draft'}
                </span>
              </div>
              {resume?.atsScore > 0 && (
                <div className="flex justify-between">
                  <span>ATS Score</span>
                  <span className="font-mono font-medium text-ink">{resume.atsScore}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sections</span>
                <span className="text-ink">{sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Language</span>
                <span className="text-ink">{resume?.language || 'en'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add section modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-float w-full max-w-sm animate-slide-up">
            <div className="p-6 border-b border-ink-100">
              <h2 className="font-display font-bold text-lg text-ink">Add section</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Section type</label>
                <select
                  className="input"
                  value={newSectionType}
                  onChange={e => setNewSectionType(e.target.value)}
                >
                  {SECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Title (optional)</label>
                <input
                  className="input"
                  placeholder={newSectionType}
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-ink-100 flex gap-3 justify-end">
              <button onClick={() => setShowAddSection(false)} className="btn-outline">Cancel</button>
              <button onClick={handleAddSection} className="btn-primary"><Plus size={14} /> Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
