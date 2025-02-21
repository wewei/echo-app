import React from 'react';
import InteractionViewRp from './InteractionViewRp';
import { Interaction } from '@/shared/types/interactionsV2';

interface InteractionViewCtProps {
  interaction: Interaction;
}

export default function InteractionViewCt({ interaction }: InteractionViewCtProps) {
  return (
    <InteractionViewRp 
      interaction={interaction} 
      hasPrevious={false} // Set this based on your logic
      hasNext={false} // Set this based on your logic
      onPrevious={() => {}} // Provide actual logic if needed
      onNext={() => {}} // Provide actual logic if needed
    />
  );
}
