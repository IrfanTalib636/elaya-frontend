export const CUSTOMER_FUNNEL_STAGES = [
  'registered',
  'studio_selected',
  'case_started',
  'case_created',
  'appointment_booked',
  'first_treatment',
  'treatment_active',
  'completed',
]

export const STUDIO_FUNNEL_STAGES = [
  'lead',
  'registration_started',
  'registration_completed',
  'verification_pending',
  'contract_pending',
  'onboarding_started',
  'onboarding_incomplete',
  'active',
]

export const CUSTOMER_DROPOFFS = [
  'registered_no_studio',
  'studio_no_case_started',
  'case_started_not_created',
  'case_created_no_appointment',
  'appointment_cancelled_not_rebooked',
]

export const STUDIO_DROPOFFS = [
  'lead_stalled',
  'verification_stalled',
  'contract_stalled',
  'onboarding_stalled',
]

export const defaultDueDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().slice(0, 10)
}
