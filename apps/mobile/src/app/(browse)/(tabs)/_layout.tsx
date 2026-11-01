import { NativeTabs } from "expo-router/native-tabs";
import { StatusBar } from "expo-status-bar";

export default function BrowseTabs() {
  return <>
    <StatusBar style="dark" />
    <NativeTabs tintColor="#003d38" backgroundColor="#f7fafb" labelStyle={{ fontFamily: "Inter_400Regular", color: "#60758d" }}>
      <NativeTabs.Trigger name="home"><NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" /><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="wishlist"><NativeTabs.Trigger.Icon sf={{ default: "heart", selected: "heart.fill" }} md="favorite" /><NativeTabs.Trigger.Label>Wishlist</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="trips"><NativeTabs.Trigger.Icon sf={{ default: "suitcase", selected: "suitcase.fill" }} md="luggage" /><NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages"><NativeTabs.Trigger.Icon sf={{ default: "bubble.left", selected: "bubble.left.fill" }} md="chat_bubble" /><NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile"><NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" /><NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    </NativeTabs>
  </>;
}
