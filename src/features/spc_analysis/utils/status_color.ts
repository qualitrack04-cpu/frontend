export function getStatusColor(status?: string | null): string {
  if (!status) return 'bg-[#f1f5f9] text-[#64748b]';

  switch (status.toLowerCase().trim()) {
    case 'capable':
    case 'process capable':
      return 'bg-[#dcfce7] text-[#16a34a]';
    case 'marginal':
      return 'bg-[#fef9c3] text-[#ca8a04]';
    case 'not capable':
      return 'bg-[#fee2e2] text-[#dc2626]';
    case 'process unstable':
    case 'unstable':
      return 'bg-[#ffedd5] text-[#ea580c]';
    default:
      return 'bg-[#f1f5f9] text-[#64748b]';
  }
}
