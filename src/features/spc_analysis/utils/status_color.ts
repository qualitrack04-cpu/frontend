export function getStatusColor(status: string): string {
  switch (status) {
    case 'Capable':
      return 'status-badge-green';
    case 'Marginal':
      return 'status-badge-yellow';
    case 'Not Capable':
      return 'status-badge-red';
    case 'Process Unstable':
      return 'status-badge-brown';
    default:
      return '';
  }
}