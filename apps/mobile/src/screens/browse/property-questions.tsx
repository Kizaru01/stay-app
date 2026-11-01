import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, { Easing, FadeIn, useReducedMotion } from "react-native-reanimated";
import { Button, Icon, Text, TextField } from "@/components/ui";
import { PressFeedback } from "@/components/ui/press-feedback";
import type { PropertyDetails } from "@/fixtures/property-details";

export type QuestionMode = "contact" | "assistant";
const topics = ["Amenities", "Guests and bedrooms", "Check-in and check-out", "Cancellation policy", "Something else"] as const;
type Topic = (typeof topics)[number];

/** Deterministic sample FAQ, not AI output or authoritative booking policy. */
export function samplePropertyAnswer(property: PropertyDetails, topic: Topic): string {
  switch (topic) {
    case "Amenities": return `This sample stay lists: ${property.amenities.map(item => item.label).join(", ")}.`;
    case "Guests and bedrooms": return `This sample stay accommodates up to ${property.guests} guests, with ${property.bedrooms} bedrooms, ${property.beds} beds and ${property.bathrooms} bathrooms.`;
    case "Check-in and check-out": return property.rules.filter(rule => rule.startsWith("Check-in:") || rule.startsWith("Check-out:")).join(". ");
    case "Cancellation policy": return property.cancellationPolicy;
    default: return "This preview only covers the listed property details and policies. For anything else, draft a question for the host. Live availability and booking terms are not connected.";
  }
}

export function PropertyQuestionOptions({ hostName, onSelect }: { hostName: string; onSelect: (mode: QuestionMode) => void }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 375 || fontScale > 1.3;
  return <View className="gap-lg">
    <Text variant="bodySmall" className="text-onboarding-muted">A little more peace of mind before you book.</Text>
    <View className={stacked ? "gap-md" : "flex-row gap-md"}>
      {([
        { mode: "contact", icon: "message", title: "Contact host", description: `Draft a question for ${hostName}` },
        { mode: "assistant", icon: "sparkle", title: "Ask AI assistant", description: "Explore details and policies" },
      ] as const).map(option => <PressFeedback key={option.mode} onPress={() => onSelect(option.mode)} accessibilityRole="button" accessibilityLabel={option.title} className={stacked ? "w-full" : "flex-1"}>
        <View className="rounded-lg border border-outline/60 bg-surface p-lg gap-md">
          <View className="flex-row items-center justify-between"><Icon name={option.icon} className="text-onboarding" /><Icon name="chevron" size="sm" className="text-onboarding-muted" /></View>
          <Text variant="buttonSmall" className="text-onboarding-ink">{option.title}</Text>
          <Text variant="caption" className="text-onboarding-muted">{option.description}</Text>
        </View>
      </PressFeedback>)}
    </View>
    <Text variant="caption" className="text-onboarding-muted">UI preview · Messages aren’t sent. Assistant answers are samples.</Text>
  </View>;
}

export function HostQuestionPreview({ property, draft, onDraftChange }: { property: PropertyDetails; draft: string; onDraftChange: (value: string) => void }) {
  return <View className="gap-lg">
    <Text variant="heading2" className="text-onboarding-ink">A question for {property.host.name}</Text>
    <Text variant="bodySmall" className="text-onboarding-muted">{property.title}</Text>
    <Text variant="caption" tone="primary">Message preview · Nothing will be sent</Text>
    <TextField label="Your question" placeholder="What would you like to know about this stay?" multiline textAlignVertical="top" maxLength={1000} value={draft} onChangeText={onDraftChange} style={{ minHeight: 144 }} hint="Your draft stays here while you explore this property. It isn’t saved after leaving the screen." />
    <Text variant="caption" className="text-onboarding-muted">{draft.length} / 1000 characters</Text>
    <Button title="Messaging not connected" disabled />
    <Text variant="bodySmall" className="text-onboarding-muted">You can prepare a question here. Contacting the host will be available when messaging is connected.</Text>
  </View>;
}

export function AssistantQuestionPreview({ property, onContactHost }: { property: PropertyDetails; onContactHost: () => void }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const reduced = useReducedMotion();
  return <View className="gap-lg">
    <View className="flex-row items-center gap-md"><Icon name="sparkle" className="text-onboarding" /><Text variant="heading2" className="flex-1 text-onboarding-ink">A little help with your stay</Text></View>
    <Text variant="bodySmall" className="text-onboarding-muted">{property.title}</Text>
    <Text variant="caption" tone="primary">Assistant preview · Sample answers, not live AI</Text>
    <Text variant="bodySmall" className="text-onboarding-muted">Choose a topic to explore the details listed for this sample property.</Text>
    <View className="gap-sm">{topics.map(item => <Button key={item} title={item} variant={item === topic ? "primary" : "secondary"} accessibilityState={{ selected: topic === item }} onPress={() => setTopic(item)} />)}</View>
    {topic ? <Animated.View key={topic} entering={reduced ? undefined : FadeIn.duration(180).easing(Easing.bezier(0.23, 1, 0.32, 1))} className="rounded-lg bg-success-soft p-lg gap-sm" accessibilityLiveRegion="polite">
      <Text variant="buttonSmall" className="text-onboarding">Sample answer · {topic}</Text>
      <Text variant="bodySmall" className="text-onboarding-ink">{samplePropertyAnswer(property, topic)}</Text>
    </Animated.View> : null}
    <Button title="Draft a question for the host" variant="ghost" onPress={onContactHost} />
  </View>;
}
