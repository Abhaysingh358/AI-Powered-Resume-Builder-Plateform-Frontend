import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Download, FileText, FileJson, File, Loader2, Trash2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useExportPdfMutation,
  useExportDocxMutation,
  useExportJsonMutation,
  useGetMyExportsQuery,
  useGetExportStatsQuery,
  useDeleteExportMutation,
} from '../../services/exportApi'
import { selectIsPremium } from '../../features/auth/authSlice'
import { authApi } from '../../services/authApi'
import { resumeApi, useGetMyResumesQuery } from '../../services/resumeApi'
import { sectionApi } from '../../services/sectionApi'
const FORMAT_CONFIG = {
  pdf:  { icon: FileText, label: 'PDF',  desc: 'Best for applying — ATS friendly',  color: 'text-danger',  bg: 'bg-danger/10' },
  docx: { icon: File,     label: 'DOCX', desc: 'Editable Word document',            color: 'text-info',    bg: 'bg-info/10'   },
  json: { icon: FileJson, label: 'JSON', desc: 'Machine-readable structured data',  color: 'text-success', bg: 'bg-success/10'},
}

export default function ExportPage() {
  const dispatch = useDispatch()
  const isPremium = useSelector(selectIsPremium)
  const [resumeId, setResumeId] = useState('')
  const [loading, setLoading]   = useState(null)

  const [exportPdf]  = useExportPdfMutation()
  const [exportDocx] = useExportDocxMutation()
  const [exportJson] = useExportJsonMutation()
  const [deleteExport] = useDeleteExportMutation()

  const { data: exportsData } = useGetMyExportsQuery()
  const { data: statsData   } = useGetExportStatsQuery()

  const { data: resumesData } = useGetMyResumesQuery()
  const myResumes = resumesData?.data || []

  const exports = exportsData?.data || []
  const stats   = statsData?.data

  const handleExport = async (format) => {
    if (!resumeId) return toast.error('Select a Resume first.')
    const id = parseInt(resumeId)
    if (isNaN(id)) return toast.error('Invalid Resume ID.')

    setLoading(format)
    try {
      // Fetch required data to build the ResumeData payload
      const resumeRes = await dispatch(resumeApi.endpoints.getResumeById.initiate(id)).unwrap()
      const profileRes = await dispatch(authApi.endpoints.getProfile.initiate()).unwrap()
      const sectionsRes = await dispatch(sectionApi.endpoints.getSectionsByResume.initiate(id)).unwrap()

      const requestPayload = {
        resumeId: id,
        resumeData: {
          resumeId: id,
          fullName: profileRes.data.fullName,
          email: profileRes.data.email,
          phone: profileRes.data.phone,
          targetJobTitle: resumeRes.data.targetJobTitle,
          sections: sectionsRes.data || []
        },
        templateId: resumeRes.data.templateId
      }

      const fn = format === 'pdf' ? exportPdf : format === 'docx' ? exportDocx : exportJson
      const res = await fn(requestPayload).unwrap()

      // Trigger download
      const a = document.createElement('a')
      a.href = res.url
      a.download = res.filename
      a.click()
      URL.revokeObjectURL(res.url)
      toast.success(`${format.toUpperCase()} downloaded!`)
    } catch (err) {
      toast.error(err?.data?.message || `Export failed.`)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (jobId) => {
    try { await deleteExport(jobId).unwrap(); toast.success('Deleted.') }
    catch { toast.error('Delete failed.') }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Export Resume</h1>
        <p className="page-subtitle">Download your resume in multiple formats.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total exports', value: stats.totalExports ?? 0 },
            { label: 'Today',         value: `${stats.exportsToday ?? 0}${!isPremium ? '/10' : ''}` },
            { label: 'Remaining today', value: isPremium ? '∞' : (stats.remainingToday ?? '—') },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <div className="font-display text-2xl font-bold text-ink">{value}</div>
              <div className="text-xs text-ink-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Export form */}
      <div className="card p-6 mb-8">
        <h2 className="font-display font-semibold text-ink mb-4">Export a resume</h2>
        <div className="mb-5">
          <label className="label">Resume ID</label>
          <select
            className="input max-w-xs"
            value={resumeId}
            onChange={e => setResumeId(e.target.value)}
          >
            <option value="" disabled>Select a resume...</option>
            {myResumes.map(r => (
              <option key={r.resumeId} value={r.resumeId}>
                {r.title} (ID: {r.resumeId})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(FORMAT_CONFIG).map(([format, config]) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={!!loading}
              className="card p-5 text-left hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
            >
              <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center mb-3`}>
                {loading === format
                  ? <Loader2 size={18} className={`animate-spin ${config.color}`} />
                  : <config.icon size={18} className={config.color} />
                }
              </div>
              <div className="font-semibold text-ink">{config.label}</div>
              <div className="text-xs text-ink-400 mt-1">{config.desc}</div>
              <div className={`mt-3 text-xs font-medium flex items-center gap-1 ${config.color}`}>
                <Download size={12} />
                {loading === format ? 'Exporting…' : `Download ${config.label}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export history */}
      {exports.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Export history</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  {['Resume', 'Format', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-ink-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exports.map(job => {
                  const cfg = FORMAT_CONFIG[job.format?.toLowerCase()] || FORMAT_CONFIG.pdf
                  return (
                    <tr key={job.jobId} className="border-b border-ink-50 hover:bg-ink-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-ink font-mono">#{job.resumeId}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[11px] ${cfg.bg} ${cfg.color}`}>
                          <cfg.icon size={10} /> {job.format}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[11px] ${job.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-400">
                        {new Date(job.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(job.jobId)} className="btn-ghost p-1.5 text-danger hover:bg-danger/10">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
