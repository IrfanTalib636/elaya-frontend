import { PageHeader } from '../../components/ui'
import ActivityFeed from '../../components/activity/ActivityFeed'
import useContent from '../../i18n/useContent'

const StudioActivity = () => {
  const { studioActivity: copy } = useContent()

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <ActivityFeed showCustomer defaultRange="d30" />
    </div>
  )
}

export default StudioActivity
