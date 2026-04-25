import { Badge } from '../ui/Badge'
import type { Referral } from '../../types/referral'

interface ReferralTableRowProps {
  referral: Referral
  onView: (id: string) => void
}

export function ReferralTableRow({ referral, onView }: ReferralTableRowProps) {
  return (
    <tr className="hover:bg-base transition-colors">
      <td className="px-5 py-4 font-medium text-primary">{referral.patient}</td>
      <td className="px-5 py-4 text-muted">{referral.diagnosis}</td>
      <td className="px-5 py-4 text-primary">{referral.specialty}</td>
      <td className="px-5 py-4 text-primary">{referral.specialist}</td>
      <td className="px-5 py-4"><Badge variant={referral.urgency} /></td>
      <td className="px-5 py-4"><Badge variant={referral.status} /></td>
      <td className="px-5 py-4 text-muted whitespace-nowrap">{referral.date}</td>
      <td className="px-5 py-4">
        <button
          onClick={() => onView(referral.id)}
          className="text-accent text-sm font-medium hover:underline"
        >
          View
        </button>
      </td>
    </tr>
  )
}
