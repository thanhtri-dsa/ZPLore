"use client"

import { TrendingUp } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const bookingData = [
  { month: 'January', newBookings: 65, repeatBookings: 45 },
  { month: 'February', newBookings: 78, repeatBookings: 52 },
  { month: 'March', newBookings: 90, repeatBookings: 60 },
  { month: 'April', newBookings: 85, repeatBookings: 58 },
  { month: 'May', newBookings: 95, repeatBookings: 65 },
  { month: 'June', newBookings: 110, repeatBookings: 75 }
];

const BookingChart = () => {
  const totalBookingsThisMonth = bookingData[bookingData.length - 1].newBookings + 
    bookingData[bookingData.length - 1].repeatBookings;
  const totalBookingsLastMonth = bookingData[bookingData.length - 2].newBookings + 
    bookingData[bookingData.length - 2].repeatBookings;
  const growthRate = ((totalBookingsThisMonth - totalBookingsLastMonth) / totalBookingsLastMonth * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Overview</CardTitle>
        <CardDescription>Monthly booking distribution</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={bookingData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="hsl(var(--border))"
              strokeOpacity={0.2}
            />
            <XAxis 
              dataKey="month" 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={12}
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              itemStyle={{
                color: 'hsl(var(--foreground))',
              }}
            />
            <Area
              type="monotone"
              dataKey="repeatBookings"
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="newBookings"
              stackId="1"
              stroke="hsl(var(--secondary))"
              fill="hsl(var(--secondary))"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending {Number(growthRate) > 0 ? 'up' : 'down'} by {Math.abs(Number(growthRate))}% this month 
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookingChart;