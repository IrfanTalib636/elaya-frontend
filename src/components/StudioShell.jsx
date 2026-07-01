import { Outlet } from 'react-router-dom'
import StudioLayout from './layout/StudioLayout'

const StudioShell = () => (
  <StudioLayout>
    <Outlet />
  </StudioLayout>
)

export default StudioShell
