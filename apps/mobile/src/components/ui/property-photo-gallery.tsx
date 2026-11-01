import { useRef, useState } from "react";
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import type { ImageSource } from "expo-image";
import { Icon } from "./icon";
import { Photo } from "./photo";
import { PressFeedback } from "./press-feedback";
import { Text } from "./text";

export type PropertyPhoto = { source: ImageSource | number; description: string };
type Props = { photos?: readonly PropertyPhoto[]; source?: ImageSource | number; description: string; title: string; aspectRatio?: number };

export function PropertyPhotoGallery({ photos, source, description, title, aspectRatio = 1.6 }: Props) {
  const slides = photos?.length ? photos : [{ source, description }];
  // Reset layout/page state if a virtualized card receives different inventory.
  const identity = slides.map(photo => `${typeof photo.source === "number" ? photo.source : photo.source?.uri ?? "missing"}:${photo.description}`).join("|");
  return <GalleryPages key={identity} slides={slides} title={title} aspectRatio={aspectRatio} />;
}

function GalleryPages({ slides, title, aspectRatio }: { slides: readonly { source?: ImageSource | number; description: string }[]; title: string; aspectRatio: number }) {
  const pager = useRef<ScrollViewInstance>(null);
  const pageRef = useRef(0);
  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);
  const reducedMotion = useReducedMotion();
  const multiple = slides.length > 1;

  function selectPage(index: number) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    pageRef.current = next;
    setPage(next);
    pager.current?.scrollTo({ x: next * width, animated: !reducedMotion });
  }
  function settled(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!width) return;
    const next = Math.max(0, Math.min(slides.length - 1, Math.round(event.nativeEvent.contentOffset.x / width)));
    pageRef.current = next;
    setPage(next);
  }
  return <View className="w-full overflow-hidden rounded-lg bg-canvas" style={{ aspectRatio }} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    {width > 0 ? <ScrollView ref={pager} horizontal pagingEnabled directionalLockEnabled bounces={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ height: "100%" }} scrollEnabled={multiple} onMomentumScrollEnd={settled} onContentSizeChange={() => pager.current?.scrollTo({ x: pageRef.current * width, animated: false })} style={{ direction: "ltr" }}>
      {slides.map((photo, index) => <Photo key={index} source={photo.source} label={`${title}, photo ${index + 1} of ${slides.length}. ${photo.description}`} style={{ width, height: "100%" }} />)}
    </ScrollView> : <Photo source={slides[0].source} label={slides[0].description} className="h-full w-full" />}
    {multiple ? <>
      <View pointerEvents="none" className="absolute top-sm left-sm rounded-full bg-black/60 px-sm py-xs"><Text variant="caption" className="text-white" accessibilityLabel={`Photo ${page + 1} of ${slides.length}`} accessibilityLiveRegion="polite">{page + 1} / {slides.length}</Text></View>
      <PressFeedback accessibilityRole="button" accessibilityLabel={`Previous photo of ${title}`} accessibilityState={{ disabled: page === 0 }} disabled={page === 0 || !width} onPress={() => selectPage(pageRef.current - 1)} className="absolute bottom-0 left-0 min-h-control-md min-w-control-md items-center justify-center" style={{ opacity: page === 0 ? 0.35 : 1 }}>
        <View className="rounded-full bg-black/50 p-xs" style={{ transform: [{ rotate: "180deg" }] }}><Icon name="chevron" size="sm" className="text-white" /></View>
      </PressFeedback>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="absolute bottom-lg self-center flex-row gap-xs rounded-full bg-black/40 px-sm py-xs">
        {slides.map((_, index) => <View key={index} className={page === index ? "h-1.5 w-1.5 rounded-full bg-white" : "h-1.5 w-1.5 rounded-full bg-white/40"} />)}
      </View>
      <PressFeedback accessibilityRole="button" accessibilityLabel={`Next photo of ${title}`} accessibilityState={{ disabled: page === slides.length - 1 }} disabled={page === slides.length - 1 || !width} onPress={() => selectPage(pageRef.current + 1)} className="absolute bottom-0 right-0 min-h-control-md min-w-control-md items-center justify-center" style={{ opacity: page === slides.length - 1 ? 0.35 : 1 }}>
        <View className="rounded-full bg-black/50 p-xs"><Icon name="chevron" size="sm" className="text-white" /></View>
      </PressFeedback>
    </> : null}
  </View>;
}
