import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRegisterMutation } from '../../services/authApi'
import { setCredentials } from '../../features/auth/authSlice'

export default function RegisterPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const [form, setForm]     = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.fullName)                          e.fullName        = 'Full name is required'
    if (!form.email)                             e.email           = 'Email is required'
    if (!form.password || form.password.length < 6) e.password    = 'Min 6 characters'
    if (form.password !== form.confirmPassword)  e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const { fullName, email, password } = form
      const res = await register({ fullName, email, password }).unwrap()
      dispatch(setCredentials({
        accessToken:  res.data.accessToken,
        refreshToken: res.data.refreshToken,
      }))
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed.')
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={type === 'password' ? (showPw ? 'text' : 'password') : type}
          className={`input ${type === 'password' ? 'pr-10' : ''} ${errors[key] ? 'input-error' : ''}`}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        />
        {type === 'password' && key === 'password' && (
          <button type="button" onClick={() => setShowPw(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[key] && <p className="text-xs text-danger mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <span className="font-display font-bold text-2xl text-ink">
            Resume<span className="text-accent bg-ink rounded px-1">AI</span>
          </span>
          <h2 className="font-display text-3xl font-bold text-ink mt-6">Create your account</h2>
          <p className="text-ink-400 mt-2">Free forever. Upgrade anytime.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('fullName', 'Full name',        'text',     'Jane Smith')}
          {field('email',    'Email address',    'email',    'you@example.com')}
          {field('password', 'Password',         'password', '••••••••')}

          <div>
            <label className="label">Confirm password</label>
            <input
              type={showPw ? 'text' : 'password'}
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            />
            {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 mt-2">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink hover:text-accent transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
