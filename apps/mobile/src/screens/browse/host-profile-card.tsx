import { View } from "react-native";
import { Badge, Surface, Text } from "@/components/ui";
import { Photo } from "@/components/ui/photo";
import type { SampleHost } from "@/fixtures/hosts";
import { DetailItem, DetailSection } from "./property-details-sections";

export function HostProfileCard({ host }: { host: SampleHost }) {
  return (
    <View className="gap-lg">
      <Surface variant="outlined" className="rounded-2xl p-xl gap-lg">
        <Photo
          source={host.avatar}
          compact
          label={`Illustrative portrait of host ${host.name}`}
          className="h-24 w-24 rounded-full self-center"
        />
        <View className="items-center gap-sm">
          <Text
            variant="heading1"
            accessibilityRole="header"
            className="font-lora-bold text-onboarding-ink text-center"
          >
            {host.name}
          </Text>
          <Text className="font-lora-regular text-onboarding-muted text-center">
            Your host in {host.location}
          </Text>
          {host.superhost ? <Badge label="Superhost" variant="superhost" /> : null}
          <Text variant="bodySmall" className="font-lora-medium text-onboarding">
            {host.yearsHosting} {host.yearsHosting === 1 ? "year" : "years"} hosting
          </Text>
        </View>
      </Surface>

      <View className="rounded-lg bg-canvas p-lg gap-xs">
        <Text variant="buttonSmall" className="font-lora-semibold text-onboarding-ink">
          Sample host profile
        </Text>
        <Text variant="caption" className="font-lora-regular text-onboarding-muted">
          Background, credentials and badges are illustrative and have not been verified.
        </Text>
      </View>

      <DetailSection title={`About ${host.name}`}>
        <Text className="font-lora-regular text-onboarding-muted">{host.bio}</Text>
        <View>
          <DetailItem icon="pin" label={`Lives in ${host.location}`} />
          <DetailItem icon="message" label={`Speaks ${host.languages}`} />
          <DetailItem icon="heart" label={`Enjoys ${host.interests.join(", ")}`} />
        </View>
      </DetailSection>

      <DetailSection title="Background and credentials">
        <DetailItem icon="bag" label={host.occupation} />
        <Text className="font-lora-regular text-onboarding-muted">{host.background}</Text>
        <View className="gap-md">
          {host.credentials.map((credential) => (
            <View key={credential.title} className="rounded-lg border border-outline/50 p-lg gap-sm">
              <Text
                variant="button"
                accessibilityRole="header"
                className="font-lora-semibold text-onboarding-ink"
              >
                {credential.title}
              </Text>
              <Text variant="bodySmall" className="font-lora-regular text-onboarding-muted">
                {credential.description}
              </Text>
            </View>
          ))}
        </View>
      </DetailSection>

      <DetailSection title="During your stay">
        <Text className="font-lora-regular text-onboarding-muted">{host.hostingApproach}</Text>
        <DetailItem icon="clock" label={host.response} />
        <Text variant="caption" className="font-lora-regular text-onboarding-muted">
          Messaging is not connected.
        </Text>
      </DetailSection>
    </View>
  );
}
