import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Layout, Zap, Lock } from 'lucide-react'

import { useGetAllTemplatesQuery } from '../../services/templateApi'
import { selectIsPremium } from '../../features/auth/authSlice'
import { TEMPLATE_CATEGORIES } from '../../utils/constants'


const FILTERS = ['All', ...TEMPLATE_CATEGORIES]


// normalize backend response (handles PascalCase + camelCase)
const normalize = (t) => {
  return {
    templateId: t.TemplateId ?? t.templateId,
    name: t.Name ?? t.name,
    description: t.Description ?? t.description,
    category: t.Category ?? t.category,
    isPremium: t.IsPremium ?? t.isPremium ?? t.tier === 'PREMIUM',
    usageCount: t.UsageCount ?? t.usageCount ?? 0,
    thumbnailUrl: t.ThumbnailUrl ?? t.thumbnailUrl ?? null
  }
}


export default function TemplatesPage() {

  const navigate = useNavigate()
  const isPremium = useSelector(selectIsPremium)

  const [filter, setFilter] = useState('All')

  const { data, isLoading } = useGetAllTemplatesQuery()


  const templates = (data?.data || data?.Data || [])
    .map(normalize)
    .filter(t => filter === 'All' || t.category === filter)



  return (
    <div className="animate-fade-in">

      {/* header */}
      <div className="page-header">
        <h1 className="page-title">Template Gallery</h1>
        <p className="page-subtitle">
          Choose a template to start your resume.
        </p>
      </div>


      {/* filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filter === f
                ? 'bg-ink text-accent border-ink'
                : 'border-ink-200 text-ink-400 hover:border-ink-400 hover:text-ink'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>


      {/* loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="skeleton h-48" />
          ))}
        </div>
      )}


      {/* templates grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {templates.map(t => {

          const locked = t.isPremium && !isPremium

          return (
            <div key={t.templateId} className="card group overflow-hidden">

              {/* thumbnail */}
              <div className="h-36 bg-gradient-to-br from-ink-50 to-ink-100 relative flex items-center justify-center overflow-hidden">

                {t.thumbnailUrl && !t.thumbnailUrl.includes('example.com')
                  ? (
                    <img
                      src={t.thumbnailUrl}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  )
                  : <Layout size={32} className="text-ink-200" />
                }

                {t.isPremium && (
                  <div className="absolute top-2 right-2">
                    <span className="badge-premium flex items-center gap-1">
                      <Zap size={10} className="fill-ink" /> Premium
                    </span>
                  </div>
                )}

                {locked && (
                  <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Lock size={20} className="text-white" />
                  </div>
                )}
              </div>


              {/* content */}
              <div className="p-3">

                <h3 className="font-semibold text-sm text-ink truncate">
                  {t.name}
                </h3>

                <p className="text-[11px] text-ink-400 mt-0.5">
                  {t.category?.replace('_', ' ')}
                </p>

                {t.description && (
                  <p className="text-[11px] text-ink-300 mt-1 line-clamp-2">
                    {t.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">

                  {t.usageCount > 0 && (
                    <span className="text-[10px] text-ink-300">
                      {t.usageCount} uses
                    </span>
                  )}

                  <button
                    onClick={() =>
                      locked
                        ? navigate('/upgrade')
                        : navigate('/resumes')
                    }
                    className={`ml-auto text-xs py-1.5 px-3 rounded-lg ${
                      locked ? 'btn-outline' : 'btn-primary'
                    }`}
                  >
                    {locked ? 'Upgrade' : 'Use'}
                  </button>

                </div>
              </div>

            </div>
          )
        })}

      </div>


      {/* empty state */}
      {!isLoading && templates.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-ink-400">
            No templates found for this category.
          </p>
        </div>
      )}

    </div>
  )
}