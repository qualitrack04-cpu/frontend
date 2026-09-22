import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function SuccessToast({ message, onDismiss, duration = 2500 }: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className="success-toast">
      <CheckCircle2 size={20} />
      <span>{message}</span>
    </div>
  );
}