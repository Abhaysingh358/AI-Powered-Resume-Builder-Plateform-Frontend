import { createApi } from '@reduxjs/toolkit/query/react'
import { createAuthBaseQuery } from '../utils/baseQuery'
import { API_URLS } from '../utils/constants'

export const exportApi = createApi({
  reducerPath: 'exportApi',
  baseQuery:   createAuthBaseQuery(API_URLS.export),
  tagTypes:    ['ExportJobs', 'ExportStats'],
  endpoints:   (build) => ({

    exportPdf: build.mutation({
      query:         (body) => ({
        url:          '/exports/pdf',
        method:       'POST',
        body,
        responseHandler: async (response) => {
          const blob = await response.blob()
          const url  = URL.createObjectURL(blob)
          return { url, filename: `resume_${body.resumeId}.pdf` }
        },
      }),
      invalidatesTags: ['ExportJobs', 'ExportStats'],
    }),

    exportDocx: build.mutation({
      query:         (body) => ({
        url:          '/exports/docx',
        method:       'POST',
        body,
        responseHandler: async (response) => {
          const blob = await response.blob()
          const url  = URL.createObjectURL(blob)
          return { url, filename: `resume_${body.resumeId}.docx` }
        },
      }),
      invalidatesTags: ['ExportJobs', 'ExportStats'],
    }),

    exportJson: build.mutation({
      query:         (body) => ({
        url:          '/exports/json',
        method:       'POST',
        body,
        responseHandler: async (response) => {
          const blob = await response.blob()
          const url  = URL.createObjectURL(blob)
          return { url, filename: `resume_${body.resumeId}.json` }
        },
      }),
      invalidatesTags: ['ExportJobs', 'ExportStats'],
    }),

    getJobStatus: build.query({
      query:        (jobId) => `/exports/status/${jobId}`,
      providesTags: (r, e, jobId) => [{ type: 'ExportJobs', id: jobId }],
    }),

    getMyExports: build.query({
      query:        () => '/exports/my',
      providesTags: ['ExportJobs'],
    }),

    getExportStats: build.query({
      query:        () => '/exports/stats',
      providesTags: ['ExportStats'],
    }),

    deleteExport: build.mutation({
      query:         (jobId) => ({ url: `/exports/${jobId}`, method: 'DELETE' }),
      invalidatesTags: ['ExportJobs', 'ExportStats'],
    }),
  }),
})

export const {
  useExportPdfMutation,
  useExportDocxMutation,
  useExportJsonMutation,
  useGetJobStatusQuery,
  useGetMyExportsQuery,
  useGetExportStatsQuery,
  useDeleteExportMutation,
} = exportApi
