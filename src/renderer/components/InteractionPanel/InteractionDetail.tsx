import React from 'react'
import { useInteraction } from '@/renderer/data/interactions'

export type InteractionDetailProps = {
  profileId: string
  interactionId: string
  onLinkClicked: (url: string) => void
};

export const InteractionDetail = ({ profileId, interactionId, onLinkClicked }: InteractionDetailProps) => {
  const interaction = useInteraction(profileId, interactionId)
  // TODO

  return <div>InteractionDetail</div>
}