import { useGetAiHistoryQuery } from '../../services/aiApi'
import { Clock, Sparkles, FileText, Target, Lightbulb, Languages, Wand2, Loader2, AlertCircle, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

const TYPE_ICONS = {
  SUMMARY: <Sparkles size={16} className="text-accent" />,
  BULLETS: <FileText size={16} className="text-emerald-400" />,
  COVER_LETTER: <FileText size={16} className="text-purple-400" />,
  IMPROVE: <Wand2 size={16} className="text-yellow-400" />,
  ATS: <Target size={16} className="text-red-400" />,
  SKILLS: <Lightbulb size={16} className="text-amber-400" />,
  TAILOR: <Wrench size={16} className="text-blue-400" />,
  TRANSLATE: <Languages size={16} className="text-cyan-400" />,
}

export default function AiHistoryPage() {
  const { data: historyData, isLoading, isError, refetch } = useGetAiHistoryQuery()
  const history = historyData?.data ?? historyData?.Data ?? []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">AI Generation History</h1>
          <p className="text-sm text-ink-400">View all your past AI requests and generated content.</p>
        </div>
        <button 
          onClick={refetch}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Clock size={16} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-ink-400">
            <Loader2 className="animate-spin mb-3" size={32} />
            <p>Loading history...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-400">
            <AlertCircle className="mb-3" size={32} />
            <p>Failed to load history. Please try again.</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-ink-400">
            <Clock className="mb-3" size={32} />
            <p>No AI requests found. Start using the AI tools!</p>
            <Link to="/ai" className="btn btn-primary mt-4">Go to AI Tools</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-ink-900 border-b border-ink-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wider">Tokens</th>
                  <th className="px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wider">Resume ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {history.map((item) => {
                  const reqType = item.requestType ?? item.RequestType;
                  const status = item.status ?? item.Status;
                  
                  return (
                    <tr key={item.requestId ?? item.RequestId} className="hover:bg-ink-900/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
                            {TYPE_ICONS[reqType] || <Sparkles size={16} className="text-accent" />}
                          </div>
                          <span className="font-medium text-ink text-sm">
                            {reqType?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-300">
                        {item.model ?? item.Model ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-300">
                        {item.tokensUsed ?? item.TokensUsed ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'COMPLETED' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-400">
                        {new Date(item.createdAt ?? item.CreatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-400">
                        {item.resumeId ?? item.ResumeId ?? 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
