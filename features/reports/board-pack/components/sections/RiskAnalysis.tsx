import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react'
import { RiskAnalysisData } from '../../types/board-pack'

interface RiskAnalysisProps {
  data: RiskAnalysisData
}

export default function RiskAnalysis({ data }: RiskAnalysisProps) {
  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.riskMatrix.map((risk, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{risk.category}</h4>
              <Badge className={getRiskColor(risk.rating)}>
                {risk.rating.toUpperCase()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="text-muted-foreground">Likelihood:</span>
                <span className="ml-1 font-medium">{risk.likelihood}/5</span>
              </div>
              <div>
                <span className="text-muted-foreground">Impact:</span>
                <span className="ml-1 font-medium">{risk.impact}/5</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Mitigations:</p>
              <ul className="text-sm space-y-1">
                {risk.mitigations.map((mitigation, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Shield className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <span>{mitigation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Top Risk Items</h3>
        <div className="space-y-2">
          {data.topRisks.map((risk, index) => (
            <Alert key={index}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">{risk.title}</p>
                  <p className="text-sm">{risk.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Owner: {risk.owner}</span>
                    <Badge variant="outline">{risk.status}</Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  )
}