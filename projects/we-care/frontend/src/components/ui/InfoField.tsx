interface InfoFieldProps {
  label: string
  value: string
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="text-sm text-primary mt-0.5">{value}</p>
    </div>
  )
}
