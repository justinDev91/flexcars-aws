"use client";

import { use } from 'react';
import { CarSitterValidation } from '@/components/carsitter-validation';

interface PageProps {
  params: Promise<{
    dropoffRequestId: string;
  }>;
}

export default function CarSitterValidationPage({ params }: PageProps) {
  const resolvedParams = use(params);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <CarSitterValidation 
        dropoffRequestId={resolvedParams.dropoffRequestId}
        onValidationComplete={(validated) => {
          // Rediriger vers une page de confirmation
          if (validated) {
            window.location.href = '/carsitter/validation-success';
          } else {
            window.location.href = '/carsitter/validation-rejected';
          }
        }}
      />
    </div>
  );
} 