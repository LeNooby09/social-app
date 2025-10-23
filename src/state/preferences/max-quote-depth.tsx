import React from 'react'

import * as persisted from '#/state/persisted'

type StateContext = number
type SetContext = (v: number) => void

const stateContext = React.createContext<StateContext>(
  persisted.defaults.maxQuoteDepth!,
)
stateContext.displayName = 'MaxQuoteDepthStateContext'
const setContext = React.createContext<SetContext>((_: number) => {})
setContext.displayName = 'MaxQuoteDepthSetContext'

export function Provider({children}: {children: React.ReactNode}) {
  const [state, setState] = React.useState(
    persisted.get('maxQuoteDepth') ?? persisted.defaults.maxQuoteDepth!,
  )

  const setStateWrapped = React.useCallback(
    (maxQuoteDepth: persisted.Schema['maxQuoteDepth']) => {
      setState(maxQuoteDepth ?? persisted.defaults.maxQuoteDepth!)
      persisted.write('maxQuoteDepth', maxQuoteDepth)
    },
    [setState],
  )

  React.useEffect(() => {
    return persisted.onUpdate('maxQuoteDepth', nextMaxQuoteDepth => {
      setState(nextMaxQuoteDepth ?? persisted.defaults.maxQuoteDepth!)
    })
  }, [setStateWrapped])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export const useMaxQuoteDepth = () => React.useContext(stateContext)
export const useSetMaxQuoteDepth = () => React.useContext(setContext)
