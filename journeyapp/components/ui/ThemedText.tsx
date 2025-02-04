import { Text, TextProps } from 'react-native';
import { useColorScheme } from 'react-native';

type ThemedTextProps = TextProps & {
  type?: 'title' | 'subtitle' | 'default';
};

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  const fontSize = type === 'title' ? 24 : type === 'subtitle' ? 18 : 16;
  const fontWeight = type === 'title' ? 'bold' : 'normal';

  return (
    <Text
      style={[
        { color, fontSize, fontWeight },
        style,
      ]}
      {...props}
    />
  );
}