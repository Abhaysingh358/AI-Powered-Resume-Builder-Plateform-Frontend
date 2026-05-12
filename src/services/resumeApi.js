import { createApi } from '@reduxjs/toolkit/query/react'
import { createAuthBaseQuery } from '../utils/baseQuery'
import { API_URLS } from '../utils/constants'

export const resumeApi = createApi({
  reducerPath: 'resumeApi',
  baseQuery:   createAuthBaseQuery(API_URLS.resume),
  tagTypes:    ['Resume', 'MyResumes', 'PublicResumes'],
  endpoints:   (build) => ({

    createResume: build.mutation({
      query:         (body) => ({ url: '/resumes', method: 'POST', body }),
      invalidatesTags: ['MyResumes'],
    }),

    getResumeById: build.query({
      query:        (id) => `/resumes/${id}`,
      providesTags: (r, e, id) => [{ type: 'Resume', id }],
    }),

    getMyResumes: build.query({
      query:        () => '/resumes/my',
      providesTags: ['MyResumes'],
    }),

    getResumesByUser: build.query({
      query:        (userId) => `/resumes/user/${userId}`,
      providesTags: ['MyResumes'],
    }),

    updateResume: build.mutation({
      query:         ({ resumeId, ...body }) => ({ url: `/resumes/${resumeId}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { resumeId }) => [{ type: 'Resume', id: resumeId }, 'MyResumes'],
    }),

    deleteResume: build.mutation({
      query:         (resumeId) => ({ url: `/resumes/${resumeId}`, method: 'DELETE' }),
      invalidatesTags: ['MyResumes'],
    }),

    duplicateResume: build.mutation({
      query:         (resumeId) => ({ url: `/resumes/${resumeId}/duplicate`, method: 'POST' }),
      invalidatesTags: ['MyResumes'],
    }),

    updateAtsScore: build.mutation({
      query:         ({ resumeId, ...body }) => ({ url: `/resumes/${resumeId}/ats-score`, method: 'PUT', body }),
      invalidatesTags: (r, e, { resumeId }) => [{ type: 'Resume', id: resumeId }, 'MyResumes'],
    }),

    publishResume: build.mutation({
      query:         (resumeId) => ({ url: `/resumes/${resumeId}/publish`, method: 'PUT' }),
      invalidatesTags: (r, e, resumeId) => [{ type: 'Resume', id: resumeId }, 'MyResumes', 'PublicResumes'],
    }),

    unpublishResume: build.mutation({
      query:         (resumeId) => ({ url: `/resumes/${resumeId}/unpublish`, method: 'PUT' }),
      invalidatesTags: (r, e, resumeId) => [{ type: 'Resume', id: resumeId }, 'MyResumes', 'PublicResumes'],
    }),

    getPublicResumes: build.query({
      query:        () => '/resumes/public',
      providesTags: ['PublicResumes'],
    }),
  }),
})

export const {
  useCreateResumeMutation,
  useGetResumeByIdQuery,
  useGetMyResumesQuery,
  useGetResumesByUserQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useDuplicateResumeMutation,
  useUpdateAtsScoreMutation,
  usePublishResumeMutation,
  useUnpublishResumeMutation,
  useGetPublicResumesQuery,
} = resumeApi
