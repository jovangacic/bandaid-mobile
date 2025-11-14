// components/GradientText.js
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface GradientTextProps {
  text: string;
  colors: readonly [string, string, ...string[]];
  style?: TextStyle;
}

const GradientText = ({ text, colors, style }: GradientTextProps) => {
  return (
    <MaskedView maskElement={<Text style={[styles.text, style]}>{text}</Text>}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.text, style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default GradientText;