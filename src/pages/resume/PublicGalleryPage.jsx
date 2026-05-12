import { useNavigate } from 'react-router-dom'
import { Globe, FileText, Eye } from 'lucide-react'
import { useGetPublicResumesQuery } from '../../services/resumeApi'

export default function PublicGalleryPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useGetPublicResumesQuery()
  const resumes = data?.data || []

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe size={22} className="text-accent" />
          </div>
          <h1 className="font-display text-4xl font-bold text-ink">Public Gallery</h1>
          <p className="text-ink-400 mt-3">Browse resumes shared by the community.</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48" />)}
          </div>
        )}

        {!isLoading && resumes.length === 0 && (
          <div className="card p-16 text-center">
            <p className="text-ink-400">No public resumes yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(r => (
            <div key={r.resumeId} className="card-hover p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink truncate">{r.title || 'Untitled'}</h3>
                  <p className="text-xs text-ink-400 mt-0.5 truncate">{r.targetJobTitle || ''}</p>
                </div>
              </div>
              {r.atsScore > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-400">ATS Score</span>
                    <span className="font-mono text-ink">{r.atsScore}%</span>
                  </div>
                  <div className="quota-bar">
                    <div className="quota-fill" style={{ width: `${r.atsScore}%` }} />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-ink-400">
                <span className="flex items-center gap-1"><Eye size={12} /> {r.viewCount ?? 0} views</span>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button onClick={() => navigate('/login')} className="btn-primary">
            Create your own resume →
          </button>
        </div>
      </div>
    </div>
  )
}
