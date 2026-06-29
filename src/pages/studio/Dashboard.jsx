import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import { toast as toastMessages } from '../../content'
import StudioLayout from '../../components/layout/StudioLayout'

export default function StudioDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    toast.success(toastMessages.logoutSuccess)
    navigate('/studio/login')
  }

  return (
    <StudioLayout onLogout={handleLogout}>
      <h1 className='text-2xl font-bold text-red-700'>Studio Dashboard</h1>
      {/* placeholder — content coming soon */}
    </StudioLayout>
  )
}
