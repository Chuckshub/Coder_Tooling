import React from 'react';
import { VendorSpendSummary } from '@/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils/comparisonLogic';
import { AlertCircle, CheckCircle, MinusCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: VendorSpendSummary['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = getStatusColor(status);
  const label = getStatusLabel(status);

  const getIcon = () => {
    switch (status) {
      case 'over-budget':
        return <XCircle className="w-4 h-4" />;
      case 'under-budget':
        return <AlertCircle className="w-4 h-4" />;
      case 'on-target':
        return <CheckCircle className="w-4 h-4" />;
      case 'no-spend':
        return <MinusCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
    >
      {getIcon()}
      {label}
    </span>
  );
};

export default StatusBadge;
