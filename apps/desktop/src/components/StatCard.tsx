import type { ReactNode } from 'react'

export function StatCard(props: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="ui-stat-card">
      <div className="ui-stat-icon">{props.icon}</div>
      <div className="ui-stat-content">
        <div className="ui-stat-label">{props.label}</div>
        <div className="ui-stat-value">{props.value}</div>
        {props.hint ? <div className="ui-stat-hint">{props.hint}</div> : null}
      </div>
    </div>
  )
}
