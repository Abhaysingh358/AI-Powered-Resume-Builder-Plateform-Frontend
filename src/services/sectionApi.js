import { createApi } from '@reduxjs/toolkit/query/react'
import { createAuthBaseQuery } from '../utils/baseQuery'
import { API_URLS } from '../utils/constants'

export const sectionApi = createApi({
  reducerPath: 'sectionApi',
  baseQuery:   createAuthBaseQuery(API_URLS.section),
  tagTypes:    ['Section', 'ResumeSections'],
  endpoints:   (build) => ({

    addSection: build.mutation({
      query:         (body) => ({ url: '/sections', method: 'POST', body }),
      invalidatesTags: ['ResumeSections'],
    }),

    getSectionsByResume: build.query({
      query:        (resumeId) => `/sections/resume/${resumeId}`,
      providesTags: (r, e, resumeId) => [{ type: 'ResumeSections', id: resumeId }],
    }),

    getSectionById: build.query({
      query:        (sectionId) => `/sections/${sectionId}`,
      providesTags: (r, e, id) => [{ type: 'Section', id }],
    }),

    updateSection: build.mutation({
      query:         ({ sectionId, ...body }) => ({ url: `/sections/${sectionId}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { sectionId }) => [{ type: 'Section', id: sectionId }, 'ResumeSections'],
    }),

    deleteSection: build.mutation({
      query:         (sectionId) => ({ url: `/sections/${sectionId}`, method: 'DELETE' }),
      invalidatesTags: ['ResumeSections'],
    }),

    reorderSections: build.mutation({
      query:         ({ resumeId, ...body }) => ({ url: `/sections/resume/${resumeId}/reorder`, method: 'PUT', body }),
      invalidatesTags: (r, e, { resumeId }) => [{ type: 'ResumeSections', id: resumeId }],
    }),

    toggleVisibility: build.mutation({
      query:         (sectionId) => ({ url: `/sections/${sectionId}/toggle-visibility`, method: 'PUT' }),
      invalidatesTags: ['ResumeSections'],
    }),

    deleteAllSections: build.mutation({
      query:         (resumeId) => ({ url: `/sections/resume/${resumeId}/all`, method: 'DELETE' }),
      invalidatesTags: ['ResumeSections'],
    }),

    getSectionByType: build.query({
      query:        ({ resumeId, sectionType }) => `/sections/resume/${resumeId}/type/${sectionType}`,
      providesTags: ['Section'],
    }),

    bulkUpdateSections: build.mutation({
      query:         ({ resumeId, ...body }) => ({ url: `/sections/resume/${resumeId}/bulk`, method: 'PUT', body }),
      invalidatesTags: ['ResumeSections'],
    }),
  }),
})

export const {
  useAddSectionMutation,
  useGetSectionsByResumeQuery,
  useGetSectionByIdQuery,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
  useToggleVisibilityMutation,
  useDeleteAllSectionsMutation,
  useGetSectionByTypeQuery,
  useBulkUpdateSectionsMutation,
} = sectionApi
