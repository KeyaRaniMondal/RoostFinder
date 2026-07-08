export interface RegisterUserPayload {
  name: string
  email: string
  password: string
  role?: "Tenant" | "Landlord" | "Admin"
  Role?: "Tenant" | "Landlord" | "Admin"
  profilePhoto?: string
}