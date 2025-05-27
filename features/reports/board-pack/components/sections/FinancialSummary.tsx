import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { FinancialSummaryData } from '../../types/board-pack'

interface FinancialSummaryProps {
  data: FinancialSummaryData
}

export default function FinancialSummary({ data }: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const surplusPercentage = data.totalIncome > 0 
    ? (data.netSurplus / data.totalIncome) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(data.totalIncome)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(data.totalExpenses)}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Surplus</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(data.netSurplus)}
              </p>
              <Badge 
                variant={data.netSurplus >= 0 ? 'default' : 'destructive'}
                className="mt-2"
              >
                {formatPercentage(Math.abs(surplusPercentage))}
                {data.netSurplus >= 0 ? ' surplus' : ' deficit'}
              </Badge>
            </div>
            <div className={`p-2 rounded-lg ${
              data.netSurplus >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`h-4 w-4 ${
                data.netSurplus >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Income by Source */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Income by Source
        </h3>
        <div className="space-y-3">
          {data.incomeBySource.map((source) => (
            <div key={source.source} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">
                  {source.source.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatPercentage(source.percentage)}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(source.amount)}
                  </span>
                </div>
              </div>
              <Progress value={source.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Expenses by Category */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Expenses by Category
        </h3>
        <div className="space-y-3">
          {data.expensesByCategory.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {category.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatPercentage(category.percentage)}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h4 className="font-semibold mb-2">Financial Health Assessment</h4>
        <div className="space-y-2 text-sm">
          {data.netSurplus >= 0 ? (
            <div className="flex items-start gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5" />
              <p>
                The charity is operating with a {formatPercentage(surplusPercentage)} surplus, 
                indicating healthy financial management. Consider allocating surplus funds to 
                reserves or program expansion.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-600 mt-0.5" />
              <p>
                The charity is operating with a {formatPercentage(Math.abs(surplusPercentage))} deficit. 
                Immediate action is required to reduce expenses or increase income to ensure 
                financial sustainability.
              </p>
            </div>
          )}
          
          {/* Income concentration risk */}
          {data.incomeBySource.some(s => s.percentage > 50) && (
            <div className="flex items-start gap-2">
              <ArrowDownRight className="h-4 w-4 text-amber-600 mt-0.5" />
              <p>
                Income concentration risk detected. Consider diversifying income sources to 
                reduce dependency on a single revenue stream.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}