import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Buildings } from '@phosphor-icons/react'

interface ComparisonChartProps {
  userValue: number
  locationType: string
}

export function ComparisonChart({ userValue, locationType }: ComparisonChartProps) {
  const averageByType: Record<string, number> = {
    'Office': 8500,
    'Retail Store': 12000,
    'Restaurant': 15000,
    'Warehouse': 6000,
    'Factory': 25000,
    'Hotel': 18000
  }
  
  const average = averageByType[locationType] || 10000
  const difference = ((userValue - average) / average * 100).toFixed(1)
  const isAboveAverage = userValue > average
  
  const data = [
    { name: 'Similar Businesses', value: average, color: 'oklch(0.70 0.02 240)' },
    { name: 'Your Business', value: userValue, color: isAboveAverage ? 'oklch(0.65 0.14 155)' : 'oklch(0.58 0.12 230)' }
  ]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Buildings className="w-5 h-5 text-primary" weight="duotone" />
          Comparison vs Similar Businesses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Your consumption is{' '}
            <span className={`font-semibold ${isAboveAverage ? 'text-accent' : 'text-primary'}`}>
              {Math.abs(Number(difference))}% {isAboveAverage ? 'lower' : 'higher'}
            </span>
            {' '}than similar {locationType.toLowerCase()}s
          </p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'oklch(0.52 0.02 240)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'oklch(0.52 0.02 240)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
