import { createApi } from '@reduxjs/toolkit/query/react'
import { createAuthBaseQuery } from '../utils/baseQuery'
import { API_URLS } from '../utils/constants'

export const templateApi = createApi({
  reducerPath: 'templateApi',
  baseQuery:   createAuthBaseQuery(API_URLS.template),
  tagTypes:    ['Template', 'Templates'],
  endpoints:   (build) => ({

    getAllTemplates: build.query({
      query:        () => '/templates',
      providesTags: ['Templates'],
    }),

    getTemplateById: build.query({
      query:        (id) => `/templates/${id}`,
      providesTags: (r, e, id) => [{ type: 'Template', id }],
    }),

    getFreeTemplates: build.query({
      query:        () => '/templates/free',
      providesTags: ['Templates'],
    }),

    getPremiumTemplates: build.query({
      query:        () => '/templates/premium',
      providesTags: ['Templates'],
    }),

    getPopularTemplates: build.query({
      query:        () => '/templates/popular',
      providesTags: ['Templates'],
    }),

    getTemplatesByCategory: build.query({
      query:        (category) => `/templates/category/${category}`,
      providesTags: ['Templates'],
    }),

    createTemplate: build.mutation({
      query:         (body) => ({ url: '/templates', method: 'POST', body }),
      invalidatesTags: ['Templates'],
    }),

    updateTemplate: build.mutation({
      query:         ({ templateId, ...body }) => ({ url: `/templates/${templateId}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { templateId }) => [{ type: 'Template', id: templateId }, 'Templates'],
    }),

    deactivateTemplate: build.mutation({
      query:         (templateId) => ({ url: `/templates/${templateId}/deactivate`, method: 'PUT' }),
      invalidatesTags: ['Templates'],
    }),

    incrementUsage: build.mutation({
      query:         (templateId) => ({ url: `/templates/${templateId}/increment-usage`, method: 'PUT' }),
      invalidatesTags: (r, e, templateId) => [{ type: 'Template', id: templateId }],
    }),
  }),
})

export const {
  useGetAllTemplatesQuery,
  useGetTemplateByIdQuery,
  useGetFreeTemplatesQuery,
  useGetPremiumTemplatesQuery,
  useGetPopularTemplatesQuery,
  useGetTemplatesByCategoryQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeactivateTemplateMutation,
  useIncrementUsageMutation,
} = templateApi
