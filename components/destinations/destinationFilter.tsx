import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const countries = [
  "Kenya",
  "Tanzania",
  "Mauritius",
  "Seychelles",
  "South Africa"
] as const;

export type Country = typeof countries[number];

interface DestinationFilterProps {
  onCountryChange: (country: Country) => void;
}

export const DestinationFilter = ({ onCountryChange }: DestinationFilterProps) => {
  return (
    <Tabs defaultValue="Kenya" className="w-full mb-6">
      <TabsList className="w-full justify-start overflow-x-auto">
        {countries.map((country) => (
          <TabsTrigger
            key={country}
            value={country}
            onClick={() => onCountryChange(country)}
            className="px-4 py-2"
          >
            {country}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};