'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { MetricCard } from '@/components/shared/metric-card'
import { ActivityItem } from '@/components/shared/activity-item'
import { Wallet, BookOpen, Dumbbell, Pill } from 'lucide-react'

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your activities and monitor progress
          </p>
        </div>

        {/* Metrics Grid */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard
              value="€1,340"
              label="Income"
              trend={{ value: '12%', direction: 'up' }}
            />
            <MetricCard
              value="12"
              label="Books"
              trend={{ value: '2 this month', direction: 'up' }}
            />
            <MetricCard
              value="8"
              label="Workouts"
              trend={{ value: '3 this week', direction: 'up' }}
            />
            <MetricCard
              value="24"
              label="Supplements"
              trend={{ value: 'No change', direction: 'neutral' }}
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-xl font-semibold mb-4">
            Recent Activity
          </h2>
          <div className="space-y-2">
            <ActivityItem
              icon={<Wallet className="w-5 h-5 text-primary" />}
              title="Grocery Shopping"
              subtitle="Today"
              meta="-€24.50"
              action={<span className="text-muted-foreground">Finances</span>}
            />
            <ActivityItem
              icon={<BookOpen className="w-5 h-5 text-primary" />}
              title="Atomic Habits"
              subtitle="Read 20 pages"
              meta="+20 pages"
              action={<span className="text-muted-foreground">Books</span>}
            />
            <ActivityItem
              icon={<Dumbbell className="w-5 h-5 text-primary" />}
              title="Morning Workout"
              subtitle="45 minutes"
              meta="Completed"
              action={<span className="text-muted-foreground">Exercises</span>}
            />
            <ActivityItem
              icon={<Pill className="w-5 h-5 text-primary" />}
              title="Vitamin D3"
              subtitle="2000 IU"
              meta="Taken"
              action={<span className="text-muted-foreground">Supplements</span>}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-xl font-semibold mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {['Add Transaction', 'Add Workout', 'Add Book', 'Add Supplement'].map((action) => (
              <button
                key={action}
                className="btn-outline h-auto py-3 px-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs text-center">{action}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
