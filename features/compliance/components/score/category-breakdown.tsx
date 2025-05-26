import { ChevronRight, CheckCircle, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ComplianceCategory, calculateCategoryScore } from '../../types/compliance-score'
import { useState } from 'react'

interface CategoryBreakdownProps {
  categories: ComplianceCategory[]
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const getCategoryScoreColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 75) return 'text-primary'
    if (score >= 60) return 'text-sage-600'
    if (score >= 50) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>
          Detailed compliance scores by category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const score = calculateCategoryScore(category)
          const completedItems = category.items.filter(item => item.completed).length
          const totalItems = category.items.length
          
          return (
            <Collapsible
              key={category.id}
              open={expandedCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <div className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{category.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {category.weight}% weight
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getCategoryScoreColor(score)}`}>
                        {score}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {completedItems}/{totalItems} items
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className={`h-4 w-4 transition-transform ${
                          expandedCategories.includes(category.id) ? 'rotate-90' : ''
                        }`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress value={score} className="h-2" />

                {/* Expandable Items */}
                <CollapsibleContent className="space-y-2 pt-2">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        item.completed
                          ? 'bg-success/5 border-success/20'
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            item.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {item.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.points} pts
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        {item.dueDate && !item.completed && (
                          <p className="text-xs text-warning">
                            Due: {new Date(item.dueDate).toLocaleDateString('en-GB')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )
        })}
      </CardContent>
    </Card>
  )
}