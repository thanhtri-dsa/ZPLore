// utils/bookingUtils.ts
export const parsePrice = (priceString: string): number => {
    return Number(priceString.replace(/,/g, ''))
  }
  
  export const formatBookingData = (
    validatedData: {
      name: string
      email: string
      phone: string
      bookingDate: Date
      guests: number
      specialRequests?: string
    },
    destinationName: string,
    price: string
  ) => {
    const nameParts = validatedData.name.trim().split(' ')
    const parsedPrice = parsePrice(price)
    
    return {
      firstname: nameParts[0],
      lastname: nameParts.slice(1).join(' '),
      email: validatedData.email,
      phone: validatedData.phone,
      bookingDate: validatedData.bookingDate.toISOString(),
      numberOfGuests: validatedData.guests,
      specialRequests: validatedData.specialRequests,
      destinationName: destinationName,
      price: parsedPrice
    }
  }