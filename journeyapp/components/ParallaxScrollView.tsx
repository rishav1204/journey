// components/ParallaxScrollView.tsx
import { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
  children: React.ReactNode;
  headerImage?: React.ReactNode;
  headerBackgroundColor?: {
    light: string;
    dark: string;
  };
};

export default function ParallaxScrollView({ 
  children, 
  headerImage, 
  headerBackgroundColor 
}: Props) {
  const [scrollY, setScrollY] = useState(0);
  const colorScheme = useColorScheme();
  const backgroundColor = headerBackgroundColor?.[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {headerImage && (
        <View 
          style={[
            styles.headerImage, 
            backgroundColor ? { backgroundColor } : null
          ]}
        >
          {headerImage}
        </View>
      )}
      <ScrollView
        onScroll={e => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        {children}
      </ScrollView>
      <BlurView
        style={[
          styles.header,
          {
            opacity: Math.min(scrollY / 100, 1),
          },
        ]}
        intensity={80}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    height: 200,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    padding: 16,
    paddingTop: 220,
  }
});