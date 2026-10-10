import React from 'react';
import { DataQualityLevel } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface DataQualityBadgeProps {
  quality: DataQualityLevel;
  className?: string;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({ quality, className }) => {
  switch (quality) {
    case 'High':
      return (
        <Badge variant="success" leftDot className={className}>
          High Quality
        </Badge>
      );
    case 'Medium':
      return (
        <Badge variant="warning" leftDot className={className}>
          Medium Quality
        </Badge>
      );
    case 'Low':
      return (
        <Badge variant="error" leftDot className={className}>
          Low Quality
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          {quality}
        </Badge>
      );
  }
};
