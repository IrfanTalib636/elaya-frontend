export const EMPTY_PRE_SESSION = {
  uv_exposition: 'keine',
  medikamente: [],
  medikament_datum: '',
}

export const preSessionToParams = (check = EMPTY_PRE_SESSION) => {
  const params = {}
  if (check.uv_exposition && check.uv_exposition !== 'keine') {
    params.uv_exposition = check.uv_exposition
  }
  if (check.medikamente?.length) {
    params.medikamente = check.medikamente.join(',')
  }
  if (check.medikament_datum) {
    params.medikament_datum = check.medikament_datum
  }
  return params
}

export const preSessionToBody = (check = EMPTY_PRE_SESSION) => {
  const body = {
    uv_exposition: check.uv_exposition || 'keine',
    medikamente: check.medikamente ?? [],
  }
  if (check.medikament_datum) {
    body.medikament_datum = check.medikament_datum
  }
  return body
}
