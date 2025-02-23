import React, { createContext, useContext } from 'react'
import { ProfileInteractionV2Api } from '@/preload/interactionsV2'

export const InteractionApiContext = createContext<ProfileInteractionV2Api | null>(null)

export const useInteractionApi = (): ProfileInteractionV2Api => {
  const context = useContext(InteractionApiContext)
  if (!context) {
    throw new Error('useInteractionApi must be used within a InteractionApiProvider')
  }
  return context
}

export const InteractionApiProvider = ({
  children,
  interactionApi,
}: {
  children: React.ReactNode;
  interactionApi: ProfileInteractionV2Api;
}) => {
  return (
    <InteractionApiContext.Provider value={interactionApi}>
      {children}
    </InteractionApiContext.Provider>
  );
};
