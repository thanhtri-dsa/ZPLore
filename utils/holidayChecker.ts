type Holiday = {
    name: string;
    date: Date;
};

const kenyanHolidays: Holiday[] = [
    { name: "New Year's Day", date: new Date(new Date().getFullYear(), 0, 1) },
    { name: "Labour Day", date: new Date(new Date().getFullYear(), 4, 1) },
    { name: "Madaraka Day", date: new Date(new Date().getFullYear(), 5, 1) },
    { name: "Mashujaa Day", date: new Date(new Date().getFullYear(), 9, 20) },
    { name: "Jamhuri Day", date: new Date(new Date().getFullYear(), 11, 12) },
    { name: "Christmas Day", date: new Date(new Date().getFullYear(), 11, 25) },
];

const specialOccasions: Holiday[] = [
    { name: "Valentine's Day", date: new Date(new Date().getFullYear(), 1, 14) },
    { name: "Easter Sunday", date: new Date(new Date().getFullYear(), 3, 9) }, // Note: Date varies each year
    { name: "Mother's Day", date: new Date(new Date().getFullYear(), 4, 14) }, // Second Sunday of May
    { name: "Father's Day", date: new Date(new Date().getFullYear(), 5, 18) }, // Third Sunday of June
    { name: "Halloween", date: new Date(new Date().getFullYear(), 9, 31) },
    { name: "Black Friday", date: new Date(new Date().getFullYear(), 10, 24) }, // Fourth Friday of November
    { name: "Cyber Monday", date: new Date(new Date().getFullYear(), 10, 27) }, // Monday following Black Friday
    { name: "New Year's Eve", date: new Date(new Date().getFullYear(), 11, 31) },
];

export function isHoliday(): Holiday | null {
    const today = new Date();
    const allHolidays = [...kenyanHolidays, ...specialOccasions];

    for (const holiday of allHolidays) {
        if (
            holiday.date.getDate() === today.getDate() &&
            holiday.date.getMonth() === today.getMonth()
        ) {
            return holiday;
        }
    }

    return null;
}

