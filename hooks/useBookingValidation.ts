// hooks/useBookingValidation.ts
import { useState } from 'react'
import { z } from 'zod'
import { BookingFormData, bookingSchema } from '../types/bookingTypes'
import { useToast } from "@/hooks/use-toast"

interface UseBookingValidation {
  errors: Record<string, string>
  validateForm: (formData: FormData, bookingDate?: Date) => BookingFormData | null
}

export const useBookingValidation = (): UseBookingValidation => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = (formData: FormData, bookingDate?: Date): BookingFormData | null => {
    try {
      const validatedData = bookingSchema.parse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        guests: Number(formData.get('guests')),
        specialRequests: formData.get('special-requests'),
        bookingDate: bookingDate,
      })
      setErrors({})
      return validatedData
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {}
        error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message
          }
        })
        setErrors(formattedErrors)
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please check the form for errors.",
        })
      }
      return null
    }
  }

  return {
    errors,
    validateForm,
  }
}