import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useContent from '../../i18n/useContent'
import AdminLayout from '../../components/layout/AdminLayout'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { toast: toastMessages, adminPages } = useContent()

  const handleLogout = async () => {
    await logout()
    toast.success(toastMessages.logoutSuccess)
    navigate('/admin/login')
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <h1 className='text-2xl font-bold text-red-700'>{adminPages.dashboard.title}</h1>
    </AdminLayout>
  )
}

export default AdminDashboard
