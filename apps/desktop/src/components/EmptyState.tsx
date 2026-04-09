import type { ReactNode } from 'react'

export function EmptyState(props: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-icon">{props.icon}</div>
      <div className="ui-empty-title">{props.title}</div>
      <div className="ui-empty-description">{props.description}</div>
    </div>
  )
}
