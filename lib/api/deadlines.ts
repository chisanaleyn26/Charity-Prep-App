interface Deadline {
  id: string
  title: string
  description: string
  date: Date
  type: 'dbs_expiry' | 'annual_return' | 'policy_review' | 'training' | 'other'
  priority: 'high' | 'medium' | 'low'
  status: 'upcoming' | 'overdue' | 'completed'
  relatedUrl?: string
}

interface CreateDeadlineData {
  title: string
  description: string
  date: Date
  type: 'dbs_expiry' | 'annual_return' | 'policy_review' | 'training' | 'other'
  priority: 'high' | 'medium' | 'low'
  relatedUrl?: string
  organizationId: string
}

interface UpdateDeadlineData {
  title?: string
  description?: string
  date?: Date
  type?: 'dbs_expiry' | 'annual_return' | 'policy_review' | 'training' | 'other'
  priority?: 'high' | 'medium' | 'low'
  status?: 'upcoming' | 'overdue' | 'completed'
  relatedUrl?: string
}

export class DeadlineService {
  private static async request(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  static async getDeadlines(): Promise<Deadline[]> {
    const result = await this.request('/api/v1/deadlines')
    
    // Transform dates from ISO strings back to Date objects
    return result.deadlines.map((deadline: any) => ({
      ...deadline,
      date: new Date(deadline.date)
    }))
  }

  static async createDeadline(data: CreateDeadlineData): Promise<Deadline> {
    const result = await this.request('/api/v1/deadlines', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    return {
      ...result.deadline,
      date: new Date(result.deadline.date)
    }
  }

  static async updateDeadline(id: string, data: UpdateDeadlineData): Promise<Deadline> {
    const result = await this.request(`/api/v1/deadlines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })

    return {
      ...result.deadline,
      date: new Date(result.deadline.date)
    }
  }

  static async completeDeadline(id: string): Promise<Deadline> {
    return this.updateDeadline(id, { status: 'completed' })
  }

  static async deleteDeadline(id: string): Promise<void> {
    await this.request(`/api/v1/deadlines/${id}`, {
      method: 'DELETE',
    })
  }
}

export type { Deadline, CreateDeadlineData, UpdateDeadlineData }