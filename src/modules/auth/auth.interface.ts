export interface LoginUser{
    email:String,
    password:String
}

export interface GoogleLoginPayload {
    name?: string
    email: string
    emailVerified?: boolean
    image?: string
}