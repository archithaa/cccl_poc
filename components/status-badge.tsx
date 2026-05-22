import { ContactStatus, STATUS_LABELS } from '@/lib/types'

const styles: Record<ContactStatus, string> = {
  not_contacted: 'bg-gray-100 text-gray-600',
  reached_out: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
}

export default function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
