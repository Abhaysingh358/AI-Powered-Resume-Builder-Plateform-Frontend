import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, FileText, Sparkles, Download,
  Layout, User, LogOut, Zap, ChevronRight, Clock,
} from 'lucide-react'
import { logout, selectCurrentUser, selectIsPremium } from '../../features/auth/authSlice'
import { useLogoutMutation } from '../../services/authApi'
import { useGetAiQuotaQuery } from '../../services/aiApi'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resumes',   icon: FileText,        label: 'My Resumes' },
  { to: '/templates', icon: Layout,          label: 'Templates'  },
  { to: '/ai',        icon: Sparkles,        label: 'AI Tools'   },
  { to: '/ai/history', icon: Clock,          label: 'AI History' },
  { to: '/export',    icon: Download,        label: 'Export'     },
  { to: '/profile',   icon: User,            label: 'Profile'    },
]

export default function DashboardLayout() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const user       = useSelector(selectCurrentUser)
  const isPremium  = useSelector(selectIsPremium)
  const [logoutApi] = useLogoutMutation()
  const { data: quotaData } = useGetAiQuotaQuery()

  const quota = quotaData?.data

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('rai_refresh_token')
      if (refreshToken) await logoutApi({ refreshToken })
    } catch {}
    dispatch(logout())
    navigate('/login')
    toast.success('Logged out.')
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-ink-100 py-6 px-3">
        {/* Logo */}
        <div className="px-3 mb-8">
          <span className="font-display font-bold text-xl text-ink">
            Resume<span className="text-accent bg-ink rounded px-1">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'nav-item-active' : 'nav-item'
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>



        {/* User area */}
        <div className="border-t border-ink-100 pt-4 mx-1">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-ink text-accent flex items-center justify-center text-xs font-bold font-display shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-ink-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-item w-full text-danger hover:bg-danger/5 hover:text-danger"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
