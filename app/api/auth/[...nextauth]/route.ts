import NextAuth from 'next-auth'
import { authOptions } from '@/lib/nextauth' // Import authOptions from the correct file

const handler = NextAuth(authOptions)

// THIS IS CRITICAL - Export both GET and POST handlers
export { handler as GET, handler as POST }
