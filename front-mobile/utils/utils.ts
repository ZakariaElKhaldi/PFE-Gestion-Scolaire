import { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle; // Narrowing down the type

export function cn(...inputs: (Style | boolean | null | undefined)[]): Style {
  return inputs
    .filter((style): style is Style => {
      return typeof style === 'object' && style !== null && !Array.isArray(style);
    })
    .reduce((acc: ViewStyle, style) => {
      // Ensure style is a valid object before spreading
      return { ...acc, ...style }; // Spread valid style objects
    }, {} as ViewStyle);
}