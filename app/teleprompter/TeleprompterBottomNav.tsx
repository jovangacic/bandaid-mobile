import React from 'react';
import BottomNav, { BottomNavTab } from '../components/BottomNav';

const TELEPROMPTER_TABS: BottomNavTab[] = [
  {
    route: '/teleprompter',
    icon: require('../../assets/icons/texts.png'),
    label: 'Texts',
  },
  {
    route: '/teleprompter/playlists',
    icon: require('../../assets/icons/playlists.png'),
    label: 'Playlists',
  },
];

export default function TeleprompterBottomNav() {
  return <BottomNav tabs={TELEPROMPTER_TABS} />;
}
