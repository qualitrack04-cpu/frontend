export interface SpcHistoryItem {
  id: string;
  productName: string;
  parameterName: string;
  date: string;
  status: 'Capable' | 'Marginal' | 'Not Capable' | 'Process Unstable';
}

export const dummyHistoryData: SpcHistoryItem[] = [
  { id: '1', productName: 'Wall Thickness - Product B', parameterName: 'Wall Thickness', date: '12 October 2026 · 23:59', status: 'Capable' },
  { id: '2', productName: 'Wall Thickness - Product B', parameterName: 'Wall Thickness', date: '12 October 2026 · 23:59', status: 'Not Capable' },
  { id: '3', productName: 'Wall Thickness - Product B', parameterName: 'Wall Thickness', date: '12 October 2026 · 23:59', status: 'Process Unstable' },
  { id: '4', productName: 'Wall Thickness - Product B', parameterName: 'Wall Thickness', date: '12 October 2026 · 23:59', status: 'Marginal' },
  { id: '5', productName: 'Wall Thickness - Product B', parameterName: 'Wall Thickness', date: '12 October 2026 · 23:59', status: 'Not Capable' },
  { id: '6', productName: 'Wall Thickness - Product B', parameterName: 'Wall Thickness', date: '12 October 2026 · 23:59', status: 'Capable' },
];