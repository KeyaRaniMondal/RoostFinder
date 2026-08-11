export interface RegisterUserPayload {
  name: string
  email: string
  password: string
  role?: "Tenant" | "Landlord" | "Admin"
  Role?: "Tenant" | "Landlord" | "Admin"
  profilePhoto?: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  profilePhoto?: string
  bio?: string
}