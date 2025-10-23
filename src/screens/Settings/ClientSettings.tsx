import React from 'react'
import {View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'

import {type CommonNavigatorParams} from '#/lib/routes/types'
import {useMaxQuoteDepth, useSetMaxQuoteDepth} from '#/state/preferences'
import * as SettingsList from '#/screens/Settings/components/SettingsList'
import {atoms as a} from '#/alf'
import {Check_Stroke2_Corner0_Rounded as CheckIcon} from '#/components/icons/Check'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'ClientSettings'>

export function ClientSettingsScreen({}: Props) {
  const {_} = useLingui()
  const maxQuoteDepth = useMaxQuoteDepth()
  const setMaxQuoteDepth = useSetMaxQuoteDepth()

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Client Settings</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <SettingsList.Container>
          <View style={[a.px_lg, a.py_md]}>
            <Text style={[a.text_md, a.font_bold, a.pb_sm]}>
              <Trans>Quote Depth</Trans>
            </Text>
            <Text style={[a.text_sm, a.pb_md]}>
              <Trans>
                Maximum number of nested quote posts to display. Quotes beyond
                this depth will not be shown.
              </Trans>
            </Text>
          </View>

          <SettingsList.PressableItem
            label={_(msg`1 level`)}
            onPress={() => setMaxQuoteDepth(1)}>
            <SettingsList.ItemText>
              <Trans>1 level</Trans>
            </SettingsList.ItemText>
            {maxQuoteDepth === 1 && <SettingsList.ItemIcon icon={CheckIcon} />}
          </SettingsList.PressableItem>

          <SettingsList.PressableItem
            label={_(msg`2 levels`)}
            onPress={() => setMaxQuoteDepth(2)}>
            <SettingsList.ItemText>
              <Trans>2 levels</Trans>
            </SettingsList.ItemText>
            {maxQuoteDepth === 2 && <SettingsList.ItemIcon icon={CheckIcon} />}
          </SettingsList.PressableItem>

          <SettingsList.PressableItem
            label={_(msg`3 levels (default)`)}
            onPress={() => setMaxQuoteDepth(3)}>
            <SettingsList.ItemText>
              <Trans>3 levels (default)</Trans>
            </SettingsList.ItemText>
            {maxQuoteDepth === 3 && <SettingsList.ItemIcon icon={CheckIcon} />}
          </SettingsList.PressableItem>

          <SettingsList.PressableItem
            label={_(msg`4 levels`)}
            onPress={() => setMaxQuoteDepth(4)}>
            <SettingsList.ItemText>
              <Trans>4 levels</Trans>
            </SettingsList.ItemText>
            {maxQuoteDepth === 4 && <SettingsList.ItemIcon icon={CheckIcon} />}
          </SettingsList.PressableItem>

          <SettingsList.PressableItem
            label={_(msg`5 levels`)}
            onPress={() => setMaxQuoteDepth(5)}>
            <SettingsList.ItemText>
              <Trans>5 levels</Trans>
            </SettingsList.ItemText>
            {maxQuoteDepth === 5 && <SettingsList.ItemIcon icon={CheckIcon} />}
          </SettingsList.PressableItem>
        </SettingsList.Container>
      </Layout.Content>
    </Layout.Screen>
  )
}
