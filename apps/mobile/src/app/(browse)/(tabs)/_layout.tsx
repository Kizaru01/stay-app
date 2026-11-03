import { Platform, View } from "react-native";
import { usePathname } from "expo-router";
import * as Haptics from "expo-haptics";
import { useReducedMotion } from "react-native-reanimated";
import { NativeTabs } from "expo-router/native-tabs";
import { StatusBar } from "expo-status-bar";

export default function BrowseTabs() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <View className="browse-tabs flex-1">
      <StatusBar style="dark" />
      <NativeTabs
        tintColor="#003d38"
        backgroundColor="#f7fafb"
        iconColor={{ default: "#60758d", selected: "#003d38" }}
        labelStyle={{
          default: { fontFamily: "Manrope_400Regular", fontSize: 11, color: "#60758d" },
          selected: { fontFamily: "Manrope_600SemiBold", fontSize: 11, color: "#003d38" },
        }}
        blurEffect="none"
        shadowColor="transparent"
        disableTransparentOnScrollEdge
        disableIndicator
        labelVisibilityMode="labeled"
        rippleColor={reducedMotion ? "transparent" : "#003d3814"}
        screenListeners={({ route }) => ({
          tabPress: (event) => {
            // NativeTabs emits this only for user actions, before navigation.
            if (
              Platform.OS === "web" ||
              reducedMotion ||
              event.data.isPrevented ||
              pathname === `/${route.name}`
            ) return;

            // Optional device feedback must never block a tab change.
            void Haptics.selectionAsync().catch(() => {});
          },
        })}
      >
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md={{ default: "home", selected: "home_filled" }}
          />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="wishlist">
          <NativeTabs.Trigger.Icon
            sf={{ default: "heart", selected: "heart.fill" }}
            md={{ default: "favorite_border", selected: "favorite" }}
          />
          <NativeTabs.Trigger.Label>Wishlist</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="trips">
          <NativeTabs.Trigger.Icon
            sf={{ default: "suitcase", selected: "suitcase.fill" }}
            md={{ default: "work_outline", selected: "work" }}
          />
          <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="messages">
          <NativeTabs.Trigger.Icon
            sf={{ default: "bubble.left", selected: "bubble.left.fill" }}
            md={{ default: "chat_bubble_outline", selected: "chat_bubble" }}
          />
          <NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon
            sf={{ default: "person", selected: "person.fill" }}
            md={{ default: "person_outline", selected: "person" }}
          />
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
