import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import { authApi }     from '../services/authApi'
import { resumeApi }   from '../services/resumeApi'
import { sectionApi }  from '../services/sectionApi'
import { aiApi }       from '../services/aiApi'
import { exportApi }   from '../services/exportApi'
import { templateApi } from '../services/templateApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]:     authApi.reducer,
    [resumeApi.reducerPath]:   resumeApi.reducer,
    [sectionApi.reducerPath]:  sectionApi.reducer,
    [aiApi.reducerPath]:       aiApi.reducer,
    [exportApi.reducerPath]:   exportApi.reducer,
    [templateApi.reducerPath]: templateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      resumeApi.middleware,
      sectionApi.middleware,
      aiApi.middleware,
      exportApi.middleware,
      templateApi.middleware,
    ),
})
