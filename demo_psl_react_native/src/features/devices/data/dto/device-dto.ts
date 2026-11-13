/** Shape of a device as stored/returned by the API and local DB. */
export interface DeviceDTO {
  id: string
  name: string
  type: string
  is_on: boolean
}
