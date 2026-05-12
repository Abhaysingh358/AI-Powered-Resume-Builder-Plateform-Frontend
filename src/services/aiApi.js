import { createApi } from '@reduxjs/toolkit/query/react'
import { createAuthBaseQuery } from '../utils/baseQuery'
import { API_URLS } from '../utils/constants'

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery:   createAuthBaseQuery(API_URLS.ai),
  tagTypes:    ['AiHistory', 'AiQuota'],
  endpoints:   (build) => ({

    generateSummary: build.mutation({
      query:         (body) => ({ url: '/ai/generate-summary', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    generateBullets: build.mutation({
      query:         (body) => ({ url: '/ai/generate-bullets', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    generateCoverLetter: build.mutation({
      query:         (body) => ({ url: '/ai/generate-cover-letter', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    improveSection: build.mutation({
      query:         (body) => ({ url: '/ai/improve-section', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    checkAts: build.mutation({
      query:         (body) => ({ url: '/ai/check-ats', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    suggestSkills: build.mutation({
      query:         (body) => ({ url: '/ai/suggest-skills', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    tailorForJob: build.mutation({
      query:         (body) => ({ url: '/ai/tailor-for-job', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    translateResume: build.mutation({
      query:         (body) => ({ url: '/ai/translate', method: 'POST', body }),
      invalidatesTags: ['AiQuota', 'AiHistory'],
    }),

    getAiHistory: build.query({
      query:        () => '/ai/history',
      providesTags: ['AiHistory'],
    }),

    getAiQuota: build.query({
      query:        () => '/ai/quota',
      providesTags: ['AiQuota'],
    }),
  }),
})

export const {
  useGenerateSummaryMutation,
  useGenerateBulletsMutation,
  useGenerateCoverLetterMutation,
  useImproveSectionMutation,
  useCheckAtsMutation,
  useSuggestSkillsMutation,
  useTailorForJobMutation,
  useTranslateResumeMutation,
  useGetAiHistoryQuery,
  useGetAiQuotaQuery,
} = aiApi
