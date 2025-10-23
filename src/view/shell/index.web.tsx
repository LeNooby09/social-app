import {useEffect, useLayoutEffect, useState} from 'react'
import {TouchableWithoutFeedback, View} from 'react-native'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useNavigation} from '@react-navigation/native'
import {RemoveScrollBar} from 'react-remove-scroll-bar'

import {useIntentHandler} from '#/lib/hooks/useIntentHandler'
import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {getCurrentRoute, isStateAtTabRoot} from '#/lib/routes/helpers'
import {type NavigationProp} from '#/lib/routes/types'
import {useGeolocationStatus} from '#/state/geolocation'
import {useIsDrawerOpen, useSetDrawerOpen} from '#/state/shell'
import {useComposerKeyboardShortcut} from '#/state/shell/composer/useComposerKeyboardShortcut'
import {useCloseAllActiveElements} from '#/state/util'
import {Lightbox} from '#/view/com/lightbox/Lightbox'
import {ModalsContainer} from '#/view/com/modals/Modal'
import {ErrorBoundary} from '#/view/com/util/ErrorBoundary'
import {atoms as a, select, useTheme} from '#/alf'
import {AgeAssuranceRedirectDialog} from '#/components/ageAssurance/AgeAssuranceRedirectDialog'
import {BlockedGeoOverlay} from '#/components/BlockedGeoOverlay'
import {EmailDialog} from '#/components/dialogs/EmailDialog'
import {LinkWarningDialog} from '#/components/dialogs/LinkWarning'
import {MutedWordsDialog} from '#/components/dialogs/MutedWords'
import {SigninDialog} from '#/components/dialogs/Signin'
import {
  Outlet as PolicyUpdateOverlayPortalOutlet,
  usePolicyUpdateContext,
} from '#/components/PolicyUpdateOverlay'
import {Outlet as PortalOutlet} from '#/components/Portal'
import {FlatNavigator, RoutesContainer} from '#/Navigation'
import {Composer} from './Composer.web'
import {DrawerContent} from './Drawer'

function ShellInner() {
  const t = useTheme()
  const isDrawerOpen = useIsDrawerOpen()
  const setDrawerOpen = useSetDrawerOpen()
  const {isDesktop} = useWebMediaQueries()
  const navigator = useNavigation<NavigationProp>()
  const closeAllActiveElements = useCloseAllActiveElements()
  const {_} = useLingui()
  const showDrawer = !isDesktop && isDrawerOpen
  const [showDrawerDelayedExit, setShowDrawerDelayedExit] = useState(showDrawer)
  const {state: policyUpdateState} = usePolicyUpdateContext()

  useLayoutEffect(() => {
    if (showDrawer !== showDrawerDelayedExit) {
      if (showDrawer) {
        setShowDrawerDelayedExit(true)
      } else {
        const timeout = setTimeout(() => {
          setShowDrawerDelayedExit(false)
        }, 160)
        return () => clearTimeout(timeout)
      }
    }
  }, [showDrawer, showDrawerDelayedExit])

  useComposerKeyboardShortcut()
  useIntentHandler()

  useEffect(() => {
    let previousRoute: string | undefined
    const unsubscribe = navigator.addListener('state', () => {
      closeAllActiveElements()

      // Scroll to top on tab change, excluding sub-menus and post -> feed transitions
      const state = navigator.getState()
      const currentRoute = getCurrentRoute(state)
      const isAtTabRoot = isStateAtTabRoot(state)

      // Only scroll to top if:
      // 1. We're at a tab root (main tabs like Home, Search, etc.)
      // 2. We're not coming from a post detail screen (exclude post -> feed)
      if (isAtTabRoot && previousRoute !== currentRoute.name) {
        const isComingFromPost =
          previousRoute === 'Post' || previousRoute === 'PostThread'
        if (!isComingFromPost) {
          window.scrollTo(0, 0)
        }
      }

      previousRoute = currentRoute.name
    })
    return unsubscribe
  }, [navigator, closeAllActiveElements])

  return (
    <>
      <ErrorBoundary>
        <FlatNavigator />
      </ErrorBoundary>
      <Composer winHeight={0} />
      <ModalsContainer />
      <MutedWordsDialog />
      <SigninDialog />
      <EmailDialog />
      <AgeAssuranceRedirectDialog />
      <LinkWarningDialog />
      <Lightbox />

      {/* Until policy update has been completed by the user, don't render anything that is portaled */}
      {policyUpdateState.completed && (
        <>
          <PortalOutlet />
        </>
      )}

      {showDrawerDelayedExit && (
        <>
          <RemoveScrollBar />
          <TouchableWithoutFeedback
            onPress={ev => {
              // Only close if press happens outside of the drawer
              if (ev.target === ev.currentTarget) {
                setDrawerOpen(false)
              }
            }}
            accessibilityLabel={_(msg`Close drawer menu`)}
            accessibilityHint="">
            <View
              style={[
                {
                  position: 'fixed',
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                  backgroundColor: showDrawer
                    ? select(t.name, {
                        light: 'rgba(0, 0, 0, 0.1)',
                        dark: 'rgba(0, 0, 0, 0.5)',
                        dim: 'rgba(10, 13, 16, 0.8)',
                      })
                    : 'transparent',
                  zIndex: 100,
                },
                a.transition_color,
              ]}>
              <View
                style={[
                  {
                    display: 'flex',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: 330,
                    maxWidth: '80%',
                    zIndex: 101,
                  },
                  showDrawer ? a.slide_in_left : a.slide_out_left,
                ]}>
                <DrawerContent />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </>
      )}

      <PolicyUpdateOverlayPortalOutlet />
    </>
  )
}

export function Shell() {
  const t = useTheme()
  const {status: geolocation} = useGeolocationStatus()
  return (
    <View style={[a.util_screen_outer, t.atoms.bg]}>
      {geolocation?.isAgeBlockedGeo ? (
        <BlockedGeoOverlay />
      ) : (
        <RoutesContainer>
          <ShellInner />
        </RoutesContainer>
      )}
    </View>
  )
}
