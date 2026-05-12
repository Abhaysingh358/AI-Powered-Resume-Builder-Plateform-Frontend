import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { User, Lock, CreditCard, Trash2, Loader2, Save, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeactivateAccountMutation,
} from '../../services/authApi'
import { selectCurrentUser, selectIsPremium, setUser, logout } from '../../features/auth/authSlice'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-6 mb-4">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-ink-100">
        <Icon size={16} className="text-ink-400" />
        <h2 className="font-display font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectCurrentUser)
  const isPremium = useSelector(selectIsPremium)

  const { data: profileData } = useGetProfileQuery()
  const [updateProfile, { isLoading: savingProfile }]  = useUpdateProfileMutation()
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation()
  const [deactivateAccount, { isLoading: deactivating }] = useDeactivateAccountMutation()

  const profile = profileData?.data

  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' })
  const [pwForm, setPwForm]           = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwErrors, setPwErrors]       = useState({})

  useEffect(() => {
    if (profile) setProfileForm({ fullName: profile.fullName || '', phone: profile.phone || '' })
  }, [profile])

  const handleProfileSave = async () => {
    try {
      const res = await updateProfile(profileForm).unwrap()
      dispatch(setUser({ fullName: res.data.fullName }))
      toast.success('Profile updated!')
    } catch { toast.error('Update failed.') }
  }

  const handlePasswordSave = async () => {
    const e = {}
    if (!pwForm.currentPassword) e.currentPassword = 'Required'
    if (pwForm.newPassword.length < 6) e.newPassword = 'Min 6 characters'
    if (pwForm.newPassword !== pwForm.confirm) e.confirm = 'Passwords do not match'
    setPwErrors(e)
    if (Object.keys(e).length) return

    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }).unwrap()
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { toast.error(err?.data?.message || 'Failed.') }
  }

  const handleDeactivate = async () => {
    if (!confirm('Deactivate your account? You will be logged out.')) return
    try {
      await deactivateAccount().unwrap()
      dispatch(logout())
      navigate('/login')
      toast.success('Account deactivated.')
    } catch { toast.error('Failed.') }
  }

  return (
    <div className="animate-fade-in max-w-xl">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account settings.</p>
      </div>

      {/* Plan badge */}
      <div className={`card p-4 mb-6 flex items-center gap-4 ${isPremium ? 'border-accent bg-accent/5' : ''}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? 'bg-ink' : 'bg-ink-50'}`}>
          <Zap size={18} className={isPremium ? 'text-accent fill-accent' : 'text-ink-300'} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-ink">{isPremium ? 'Premium Plan' : 'Free Plan'}</div>
          <div className="text-xs text-ink-400">{isPremium ? 'Unlimited AI calls & exports' : '5 AI calls/month · 10 PDF exports/day'}</div>
        </div>
        {!isPremium && (
          <button onClick={() => navigate('/upgrade')} className="btn-accent text-sm">
            Upgrade
          </button>
        )}
      </div>

      {/* Profile info */}
      <Section title="Personal info" icon={User}>
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={profileForm.fullName}
              onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone number</label>
            <input className="input" value={profileForm.phone}
              onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input className="input" value={profile?.email || ''} disabled />
          </div>
          <button onClick={handleProfileSave} disabled={savingProfile} className="btn-primary">
            {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </Section>

      {/* Password */}
      {profile?.provider === 'LOCAL' && (
        <Section title="Change password" icon={Lock}>
          <div className="space-y-4">
            {[
              ['currentPassword', 'Current password'],
              ['newPassword',     'New password'],
              ['confirm',         'Confirm new password'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="password"
                  className={`input ${pwErrors[key] ? 'input-error' : ''}`}
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                />
                {pwErrors[key] && <p className="text-xs text-danger mt-1">{pwErrors[key]}</p>}
              </div>
            ))}
            <button onClick={handlePasswordSave} disabled={savingPassword} className="btn-primary">
              {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {savingPassword ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </Section>
      )}

      {/* Danger zone */}
      <Section title="Danger zone" icon={Trash2}>
        <p className="text-sm text-ink-400 mb-4">
          Deactivating your account will log you out and hide your profile. Your data is preserved.
        </p>
        <button onClick={handleDeactivate} disabled={deactivating} className="btn-danger">
          {deactivating ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {deactivating ? 'Deactivating…' : 'Deactivate account'}
        </button>
      </Section>
    </div>
  )
}
