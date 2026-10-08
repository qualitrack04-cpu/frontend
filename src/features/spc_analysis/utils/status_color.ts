export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'capable':
      return 'bg-[#dcfce7] text-[#16a34a]';
    case 'marginal':
      return 'bg-[#fef9c3] text-[#ca8a04]';
    case 'not capable':
      return 'bg-[#fee2e2] text-[#dc2626]';
    case 'process unstable':
      return 'bg-[#ffedd5] text-[#ea580c]';
    default:
      return 'bg-[#f1f5f9] text-[#64748b]';
  }
}