import React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Search } from 'lucide-react';

const destinations = [
  {
    id: 1,
    name: "Masai Mara Safari",
    location: "Kenya",
    category: "Safari"
  },
  {
    id: 2,
    name: "Zanzibar Beaches",
    location: "Tanzania",
    category: "Beach"
  },
  // Add more destinations...
];

export const CommandSearch = () => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center w-full max-w-sm mx-auto space-x-2 text-sm text-gray-500 border rounded-lg px-3 py-2 hover:border-gray-300 transition-all duration-200"
      >
        <Search className="w-4 h-4" />
        <span>Search destinations... (⌘ K)</span>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a destination..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Destinations">
            {destinations.map((dest) => (
              <CommandItem
                key={dest.id}
                onSelect={() => {
                  // Handle destination selection
                  setOpen(false);
                }}
              >
                <span className="mr-2">🌍</span>
                {dest.name} - {dest.location}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};