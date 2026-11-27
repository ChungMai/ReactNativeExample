// WEB – Home in the browser. Same view model as mobile (useHomeScreen).
import { HomeWide } from '../../shared/components/home-wide'
import { useHomeScreen } from '../../shared/hooks/use-home-screen'

export default function HomeScreen() {
  return <HomeWide vm={useHomeScreen()} />
}
