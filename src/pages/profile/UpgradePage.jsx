import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Zap, Check, Sparkles, FileText, Download, Layout, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUpdateSubscriptionMutation } from '../../services/authApi'
import { setUser } from '../../features/auth/authSlice'

const FEATURES = [
  { icon: Sparkles, label: 'Unlimited AI calls per month' },
  { icon: FileText, label: 'Unlimited resume exports' },
  { icon: Layout,   label: 'Access to all premium templates' },
  { icon: Zap,      label: 'Cover letter generation' },
  { icon: Zap,      label: 'Resume tailoring for specific jobs' },
  { icon: Zap,      label: 'Translate resume to any language' },
]

export default function UpgradePage() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const [updateSubscription, { isLoading }] = useUpdateSubscriptionMutation()

  const handleUpgrade = async () => {
    // In production, this would redirect to Stripe / payment flow.
    // For now, simulate direct upgrade.
    try {
      await updateSubscription({ plan: 'PREMIUM' }).unwrap()
      dispatch(setUser({ subscriptionPlan: 'PREMIUM' }))
      toast.success('You\'re now Premium! 🎉')
      navigate('/dashboard')
    } catch { toast.error('Upgrade failed.') }
  }

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap size={28} className="text-accent fill-accent" />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink">Go Premium</h1>
        <p className="text-ink-400 mt-3">Unlock the full power of ResumeAI.</p>
      </div>

      {/* Pricing card */}
      <div className="card border-2 border-ink p-8 mb-6">
        <div className="flex items-end gap-2 mb-1">
          <span className="font-display text-5xl font-bold text-ink">$9</span>
          <span className="text-ink-400 mb-2">/month</span>
        </div>
        <p className="text-ink-400 text-sm mb-6">Cancel anytime. No commitments.</p>

        <ul className="space-y-3 mb-8">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-ink">
              <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center shrink-0">
                <Check size={11} strokeWidth={3} className="text-ink" />
              </div>
              {label}
            </li>
          ))}
        </ul>

        <button onClick={handleUpgrade} disabled={isLoading} className="btn-accent w-full py-3 text-base">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="fill-ink" />}
          {isLoading ? 'Processing…' : 'Upgrade to Premium'}
        </button>
      </div>

      {/* Free comparison */}
      <div className="card p-5 bg-ink-50 border-ink-100">
        <h3 className="font-semibold text-sm text-ink mb-3">Free plan includes</h3>
        <ul className="space-y-2 text-sm text-ink-400">
          {['3 resumes', '5 AI calls/month', '3 ATS checks/month', '10 PDF exports/day', 'Free templates'].map(item => (
            <li key={item} className="flex items-center gap-2"><Check size={13} className="text-ink-300" /> {item}</li>
          ))}
        </ul>
      </div>

      <button onClick={() => navigate(-1)} className="mt-6 btn-ghost w-full justify-center">
        Maybe later
      </button>
    </div>
  )
}
