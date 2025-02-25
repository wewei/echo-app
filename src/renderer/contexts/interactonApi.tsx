import React, { createContext, useContext } from 'react'
import { ProfileInteractionApi } from '@/preload/interactions'

export const InteractionApiContext = createContext<ProfileInteractionApi | null>(null)

export const useInteractionApi = (): ProfileInteractionApi => {
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
  interactionApi: ProfileInteractionApi;
}) => {
  return (
    <InteractionApiContext.Provider value={interactionApi}>
      {children}
    </InteractionApiContext.Provider>
  );
};
