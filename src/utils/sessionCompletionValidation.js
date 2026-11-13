const isFilled = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return !Number.isNaN(value)
  return true
}

const entryComplete = (entry) =>
  isFilled(entry?.wavelength_nm) &&
  entry?.fluence_j_cm2 !== '' &&
  entry?.fluence_j_cm2 != null &&
  !Number.isNaN(Number(entry.fluence_j_cm2)) &&
  entry?.spot_size_mm !== '' &&
  entry?.spot_size_mm != null &&
  !Number.isNaN(Number(entry.spot_size_mm)) &&
  entry?.frequency_hz !== '' &&
  entry?.frequency_hz != null &&
  !Number.isNaN(Number(entry.frequency_hz)) &&
  entry?.pass_count !== '' &&
  entry?.pass_count != null &&
  !Number.isNaN(Number(entry.pass_count))

/**
 * @returns {{ ok: boolean, errors: Record<string, string>, messages: string[] }}
 */
export function validateSessionFormForCompletion({
  form,
  prePhotoFile,
  hasExistingPrePhoto = false,
  zoneMissing = false,
  copy = {},
}) {
  const errors = {}
  const messages = []

  const add = (key, message) => {
    if (!errors[key]) errors[key] = message
    messages.push(message)
  }

  if (!form.treatment_date) {
    add('treatment_date', copy.dateRequired || 'Treatment date is required.')
  }
  if (zoneMissing) {
    add('zonen_id', copy.zoneRequired || 'Please select the zone that was treated.')
  }

  if (form.is_no_show) {
    return { ok: messages.length === 0, errors, messages }
  }

  if (!isFilled(form.mitarbeiter_id) && !isFilled(form.mitarbeiter_name)) {
    add('mitarbeiter_id', copy.staffRequired || 'Please select who performed the treatment.')
  }
  if (form.dauer_minuten === '' || form.dauer_minuten == null || Number(form.dauer_minuten) < 0) {
    add('dauer_minuten', copy.durationRequired || 'Duration (min) is required.')
  }

  if (!isFilled(form.laser_device_id)) {
    add('laser_device_id', copy.laserRequired || 'Please select a laser.')
  }

  const entries = Array.isArray(form.wavelength_entries) ? form.wavelength_entries : []
  if (!entries.length) {
    add('wavelength_entries', copy.wavelengthRequired || 'Add at least one wavelength parameter set.')
  } else {
    entries.forEach((entry, index) => {
      if (!entryComplete(entry)) {
        add(
          `wavelength_${index}`,
          copy.wavelengthIncomplete ||
            `Wavelength ${index + 1}: wavelength, fluence, spot, frequency and passes are required.`
        )
      }
    })
  }

  if (form.cooling_used !== true && form.cooling_used !== false) {
    add('cooling_used', copy.coolingRequired || 'Please select Yes or No for cooling used.')
  }

  const reactions = Array.isArray(form.endpoint_reactions) ? form.endpoint_reactions : []
  if (!reactions.length) {
    add('endpoint_reactions', copy.endpointRequired || 'Select at least one immediate skin reaction.')
  }
  if (reactions.includes('other') && !isFilled(form.endpoint_reaction_note)) {
    add(
      'endpoint_reaction_note',
      copy.endpointOtherRequired || 'Please describe the other reaction.'
    )
  }

  if (form.unusual_immediate_reaction) {
    if (!isFilled(form.unusual_reaction_type)) {
      add('unusual_reaction_type', copy.unusualTypeRequired || 'Unusual reaction type is required.')
    }
    if (!isFilled(form.unusual_reaction_description)) {
      add(
        'unusual_reaction_description',
        copy.unusualDescriptionRequired || 'Unusual reaction description is required.'
      )
    }
    if (!isFilled(form.unusual_reaction_action_taken)) {
      add(
        'unusual_reaction_action_taken',
        copy.unusualActionRequired || 'Action taken is required.'
      )
    }
  }

  const skipped = !!form.pre_photo_unavailable
  if (!skipped && !prePhotoFile && !hasExistingPrePhoto) {
    add(
      'pre_photo',
      copy.prePhotoRequired ||
        'Pre-treatment photo is required, or mark “Photo cannot be taken” with a reason.'
    )
  }
  if (skipped && !isFilled(form.pre_photo_unavailable_reason)) {
    add(
      'pre_photo_unavailable_reason',
      copy.prePhotoSkipReasonRequired || 'Please enter a reason why the photo cannot be taken.'
    )
  }

  return { ok: messages.length === 0, errors, messages }
}
