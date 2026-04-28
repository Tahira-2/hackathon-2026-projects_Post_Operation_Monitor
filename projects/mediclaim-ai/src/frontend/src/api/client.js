import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Accept': 'application/json' },
})

export async function analyzeBill(file, insuranceProvider) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('insurance_provider', insuranceProvider)
  const { data } = await API.post('/bills/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getInsuranceProviders() {
  const { data } = await API.get('/insurance/providers')
  return data.providers
}

export async function getCoverage(provider, amount) {
  const { data } = await API.get('/insurance/coverage', {
    params: { provider, amount },
  })
  return data
}

export async function createFhirEob(analysisData, insuranceProvider) {
  const { data } = await API.post(`/fhir/eob?insurance_provider=${insuranceProvider}`, analysisData)
  return data
}

export async function downloadFhirEob(billId) {
  const { data } = await API.get(`/fhir/eob/${billId}/download`)
  return data
}

export async function downloadDemoBill(type) {
  const response = await API.get(`/bills/demo/${type}`, { responseType: 'blob' })
  return response.data
}

export default API
