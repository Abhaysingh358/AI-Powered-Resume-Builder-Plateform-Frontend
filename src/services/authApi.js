import { createApi } from '@reduxjs/toolkit/query/react'
import { createAuthBaseQuery } from '../utils/baseQuery'
import { API_URLS } from '../utils/constants'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery:   createAuthBaseQuery(API_URLS.auth),
  tagTypes:    ['Profile'],
  endpoints:   (build) => ({

    register: build.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    logout: build.mutation({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),

    refresh: build.mutation({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
    }),

    getProfile: build.query({
      query:        () => '/auth/profile',
      providesTags: ['Profile'],
    }),

    updateProfile: build.mutation({
      query:         (body) => ({ url: '/auth/profile', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),

    changePassword: build.mutation({
      query: (body) => ({ url: '/auth/password', method: 'PUT', body }),
    }),

    updateSubscription: build.mutation({
      query:         (body) => ({ url: '/auth/subscription', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),

    deactivateAccount: build.mutation({
      query: () => ({ url: '/auth/deactivate', method: 'DELETE' }),
    }),

    googleLogin: build.mutation({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUpdateSubscriptionMutation,
  useDeactivateAccountMutation,
  useGoogleLoginMutation,
} = authApi
