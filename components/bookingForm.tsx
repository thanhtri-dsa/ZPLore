import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface BookingFormProps {
  destination: string;
}

interface BookingFormData {
  name: string;
  email: string;
  people: number;
  date: Date | undefined;
  specialRequirements: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ destination }) => {
  const [formData, setFormData] = React.useState<BookingFormData>({
    name: '',
    email: '',
    people: 1,
    date: undefined,
    specialRequirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Adventure</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Destination</Label>
            <Input value={destination} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="people">Number of People</Label>
            <Input
              id="people"
              name="people"
              type="number"
              min="1"
              value={formData.people}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Travel Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Input
              id="specialRequirements"
              name="specialRequirements"
              placeholder="Any special requirements?"
              value={formData.specialRequirements}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" className="w-full">
            Book Now
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};