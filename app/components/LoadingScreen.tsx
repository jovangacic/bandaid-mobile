import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import theme, { colors } from '../theme/colors';
import GradientText from './GradientText';

interface LoadingScreenProps {
  title?: string;
  text?: string;
}

// Guitar Pick Wobble Animation
// The guitar pick wobbles/rotates as if being strummed or bouncing
export default function LoadingScreen({ title, text }: LoadingScreenProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Start animation immediately
    rotation.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(-12, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) }),
        withTiming(0, { duration: 400 }) // Pause before next wobble
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.titleContainer}>
            <GradientText
            text="bandaid"
            colors={[colors.purple[700], colors.orange[400]]}
            style={{ fontSize: 40 }}
        />
        </View>
      )}
      
      <Animated.Image
        source={require('../../assets/images/bandaid-sign-04.png')}
        style={[styles.logo, animatedStyle]}
        resizeMode="contain"
      />
      
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  titleContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradient: {
    flex: 1,
  },
  transparentText: {
    opacity: 0,
  },
  logo: {
    width: theme.isTablet ? 210 : 140,
    height: theme.isTablet ? 210 : 140,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
});
