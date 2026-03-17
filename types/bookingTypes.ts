import { z } from "zod"

export const bookingSchema = z.object({
  name: z.string().min(1, "Full name is required").refine(
    (name) => name.trim().split(' ').length >= 2,
    "Please enter both first and last name"
  ),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  guests: z.number().min(1, "At least one guest is required"),
  specialRequests: z.string().optional(),
  bookingDate: z.date({
    required_error: "Please select a date",
  }),
})

export type BookingFormData = z.infer<typeof bookingSchema>

export interface BookingData {
  firstname: string
  lastname: string
  email: string
  phone: string
  bookingDate: string
  numberOfGuests: number
  specialRequests?: string
  destinationName: string
  price: number
}