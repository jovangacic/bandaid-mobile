import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SideMenu from '../components/SideMenu';
import theme from '../theme/colors';

const TIME_SIGNATURES = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '5/4', beats: 5 },
  { label: '6/8', beats: 6 },
];

export default function Metronome() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[2]); // 4/4
  
  const intervalRef = useRef<number | null>(null);
  const beatAnimation = useRef(new Animated.Value(1)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const accentSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadSounds();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (accentSoundRef.current) {
        accentSoundRef.current.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadSounds = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      // Create simple beep sounds using base64 encoded audio
      // These are minimal WAV files for click sounds
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/click.wav')
      );
      soundRef.current = sound;

      const { sound: accentSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/accent.wav')
      );
      accentSoundRef.current = accentSound;
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  };

  const playSound = async (isAccent: boolean) => {
    try {
      const sound = isAccent ? accentSoundRef.current : soundRef.current;
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const animateBeat = () => {
    Animated.sequence([
      Animated.timing(beatAnimation, {
        toValue: 1.3,
        duration: 50,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(beatAnimation, {
        toValue: 1,
        duration: 100,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const interval = (60 / bpm) * 1000;
    let beat = 0;

    const tick = () => {
      setCurrentBeat(beat);
      playSound(beat === 0);
      animateBeat();
      beat = (beat + 1) % timeSignature.beats;
    };

    tick(); // Play immediately
    intervalRef.current = setInterval(tick, interval);
    setIsPlaying(true);
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(240, bpm + delta));
    setBpm(newBpm);
    if (isPlaying) {
      stopMetronome();
      setTimeout(() => startMetronome(), 50);
    }
  };

  const handleBpmInput = (text: string) => {
    const value = parseInt(text);
    if (!isNaN(value) && value >= 40 && value <= 240) {
      setBpm(value);
      if (isPlaying) {
        stopMetronome();
        setTimeout(() => startMetronome(), 50);
      }
    } else if (text === '') {
      setBpm(40);
    }
  };

  const selectTimeSignature = (sig: typeof TIME_SIGNATURES[0]) => {
    setTimeSignature(sig);
    if (isPlaying) {
      stopMetronome();
      setTimeout(() => startMetronome(), 50);
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        <PageHeader
          title="Metronome"
          count={0}
          onMenuPress={() => setMenuVisible(true)}
        />

        <View style={styles.content}>
          {/* BPM Display */}
          <View style={styles.bpmContainer}>
            <Text style={styles.bpmLabel}>BPM</Text>
            <View style={styles.bpmDisplay}>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => adjustBpm(-1)}
              >
                <Text style={styles.bpmButtonText}>−</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.bpmValue}
                value={bpm.toString()}
                onChangeText={handleBpmInput}
                keyboardType="numeric"
                maxLength={3}
                selectTextOnFocus
              />
              
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => adjustBpm(1)}
              >
                <Text style={styles.bpmButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick BPM adjustments */}
            <View style={styles.quickBpmButtons}>
              <TouchableOpacity
                style={styles.quickBpmButton}
                onPress={() => adjustBpm(-10)}
              >
                <Text style={styles.quickBpmText}>−10</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBpmButton}
                onPress={() => adjustBpm(-5)}
              >
                <Text style={styles.quickBpmText}>−5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBpmButton}
                onPress={() => adjustBpm(5)}
              >
                <Text style={styles.quickBpmText}>+5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBpmButton}
                onPress={() => adjustBpm(10)}
              >
                <Text style={styles.quickBpmText}>+10</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Visual Beat Indicator */}
          <View style={styles.beatIndicatorContainer}>
            {Array.from({ length: timeSignature.beats }).map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.beatDot,
                  currentBeat === index && styles.beatDotActive,
                  currentBeat === index && {
                    transform: [{ scale: beatAnimation }],
                  },
                  index === 0 && styles.beatDotAccent,
                ]}
              />
            ))}
          </View>

          {/* Time Signature Selector */}
          <View style={styles.timeSignatureContainer}>
            <Text style={styles.sectionLabel}>Time Signature</Text>
            <View style={styles.timeSignatureButtons}>
              {TIME_SIGNATURES.map((sig) => (
                <TouchableOpacity
                  key={sig.label}
                  style={[
                    styles.timeSignatureButton,
                    timeSignature.label === sig.label &&
                      styles.timeSignatureButtonActive,
                  ]}
                  onPress={() => selectTimeSignature(sig)}
                >
                  <Text
                    style={[
                      styles.timeSignatureText,
                      timeSignature.label === sig.label &&
                        styles.timeSignatureTextActive,
                    ]}
                  >
                    {sig.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Play/Stop Button */}
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={toggleMetronome}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? 'STOP' : 'START'}
            </Text>
          </TouchableOpacity>

          {/* Tempo Guide */}
          <View style={styles.tempoGuide}>
            <Text style={styles.tempoGuideTitle}>Tempo Guide</Text>
            <Text style={styles.tempoGuideText}>
              {bpm < 60 && 'Largo - Very slow'}
              {bpm >= 60 && bpm < 76 && 'Adagio - Slow'}
              {bpm >= 76 && bpm < 108 && 'Andante - Walking pace'}
              {bpm >= 108 && bpm < 120 && 'Moderato - Moderate'}
              {bpm >= 120 && bpm < 168 && 'Allegro - Fast'}
              {bpm >= 168 && 'Presto - Very fast'}
            </Text>
          </View>
        </View>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 2,
  },
  bpmLabel: {
    fontSize: 18,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  bpmDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  bpmButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
  },
  bpmButtonText: {
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bpmValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: theme.colors.text,
    minWidth: 180,
    textAlign: 'center',
  },
  quickBpmButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  quickBpmButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  quickBpmText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  beatIndicatorContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl * 2,
  },
  beatDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
  },
  beatDotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  beatDotAccent: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  timeSignatureContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 2,
  },
  sectionLabel: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  timeSignatureButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  timeSignatureButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary + '20',
  },
  timeSignatureButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeSignatureText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
  },
  timeSignatureTextActive: {
    color: theme.colors.background,
  },
  playButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonActive: {
    backgroundColor: theme.colors.error,
  },
  playButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  tempoGuide: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  tempoGuideTitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  tempoGuideText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});
