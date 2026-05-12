import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLoginMutation } from '../../services/authApi'
import { setCredentials } from '../../features/auth/authSlice'

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [login, { isLoading }] = useLoginMutation()
  const [form, setForm]        = useState({ email: '', password: '' })
  const [showPw, setShowPw]    = useState(false)
  const [errors, setErrors]    = useState({})

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const res = await login(form).unwrap()
      dispatch(setCredentials({
        accessToken:  res.data.accessToken,
        refreshToken: res.data.refreshToken,
      }))
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#E8FF4720_0%,_transparent_60%)]" />
        <div>
          <span className="font-display font-bold text-2xl text-white">
            Resume<span className="text-accent bg-white/10 rounded px-1">AI</span>
          </span>
        </div>
        <div className="relative">
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Build resumes<br />
            <span className="text-accent">that get you hired.</span>
          </h1>
          <p className="text-ink-300 text-lg leading-relaxed max-w-md">
            AI-powered resume builder with ATS optimization, smart suggestions, and beautiful templates.
          </p>
          <div className="mt-10 flex gap-6">
            {[['10k+', 'Resumes built'], ['94%', 'ATS pass rate'], ['3x', 'More interviews']].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-bold text-accent">{n}</div>
                <div className="text-xs text-ink-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-ink-500 text-xs">© 2025 ResumeAI. All rights reserved.</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-ink">Welcome back</h2>
            <p className="text-ink-400 mt-2">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-ink hover:text-accent transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
