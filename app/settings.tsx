import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Layout from './components/Layout';
import { OrientationMode, useSettings } from './context/SettingsContext';
import theme from './theme/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, saveSettings, resetSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    applyOrientation(settings.orientationMode);
  }, [settings.orientationMode]);

  const applyOrientation = async (mode: OrientationMode) => {
    try {
      switch (mode) {
        case 'portrait':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
          break;
        case 'landscape':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          break;
        case 'auto':
          await ScreenOrientation.unlockAsync();
          break;
      }
    } catch (error) {
      console.error('Error applying orientation:', error);
    }
  };

  const updateSetting = async <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await saveSettings(newSettings);
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 300);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await resetSettings();
              setTimeout(() => setIsSaving(false), 500);
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Display Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Keep Screen On</Text>
                <Text style={styles.settingDescription}>
                  Prevent screen from dimming during playback
                </Text>
              </View>
              <Switch
                value={settings.keepScreenOn}
                onValueChange={(value) => updateSetting('keepScreenOn', value)}
                trackColor={{ false: '#444444', true: theme.colors.primary }}
                thumbColor={settings.keepScreenOn ? theme.colors.accent : '#999999'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Mirror Mode</Text>
                <Text style={styles.settingDescription}>
                  Flip text horizontally for teleprompter glass
                </Text>
              </View>
              <Switch
                value={settings.mirrorMode}
                onValueChange={(value) => updateSetting('mirrorMode', value)}
                trackColor={{ false: '#444444', true: theme.colors.primary }}
                thumbColor={settings.mirrorMode ? theme.colors.accent : '#999999'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Word Count</Text>
                <Text style={styles.settingDescription}>
                  Display word count when creating/editing texts
                </Text>
              </View>
              <Switch
                value={settings.showWordCount}
                onValueChange={(value) => updateSetting('showWordCount', value)}
                trackColor={{ false: '#444444', true: theme.colors.primary }}
                thumbColor={settings.showWordCount ? theme.colors.accent : '#999999'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfoFull}>
                <Text style={styles.settingLabel}>Screen Orientation</Text>
                <Text style={styles.settingDescription}>
                  Control how the screen rotates
                </Text>
                <View style={styles.orientationButtons}>
                  <TouchableOpacity
                    style={[
                      styles.orientationButton,
                      settings.orientationMode === 'auto' && styles.orientationButtonActive
                    ]}
                    onPress={() => updateSetting('orientationMode', 'auto')}
                  >
                    <Text style={[
                      styles.orientationButtonText,
                      settings.orientationMode === 'auto' && styles.orientationButtonTextActive
                    ]}>
                      Auto-Rotate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.orientationButton,
                      settings.orientationMode === 'portrait' && styles.orientationButtonActive
                    ]}
                    onPress={() => updateSetting('orientationMode', 'portrait')}
                  >
                    <Text style={[
                      styles.orientationButtonText,
                      settings.orientationMode === 'portrait' && styles.orientationButtonTextActive
                    ]}>
                      Portrait Only
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.orientationButton,
                      settings.orientationMode === 'landscape' && styles.orientationButtonActive
                    ]}
                    onPress={() => updateSetting('orientationMode', 'landscape')}
                  >
                    <Text style={[
                      styles.orientationButtonText,
                      settings.orientationMode === 'landscape' && styles.orientationButtonTextActive
                    ]}>
                      Landscape Only
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Default Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Defaults</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfoFull}>
                <View style={styles.labelRow}>
                  <Text style={styles.settingLabel}>Default Speed</Text>
                  <Text style={styles.settingValue}>{settings.defaultSpeed.toFixed(1)}x</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Default scrolling speed for new texts
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={5}
                  step={0.1}
                  value={settings.defaultSpeed}
                  onSlidingComplete={(value) => updateSetting('defaultSpeed', value)}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.backgroundLight}
                  thumbTintColor={theme.colors.accent}
                />
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfoFull}>
                <View style={styles.labelRow}>
                  <Text style={styles.settingLabel}>Default Font Size</Text>
                  <Text style={styles.settingValue}>{settings.defaultFontSize}</Text>
                </View>
                <Text style={styles.settingDescription}>
                  Default text size for new texts
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={16}
                  maximumValue={48}
                  step={1}
                  value={settings.defaultFontSize}
                  onSlidingComplete={(value) => updateSetting('defaultFontSize', value)}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.backgroundLight}
                  thumbTintColor={theme.colors.accent}
                />
              </View>
            </View>
          </View>

          {/* Behavior Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Behavior</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Confirm Delete</Text>
                <Text style={styles.settingDescription}>
                  Show confirmation dialog before deleting
                </Text>
              </View>
              <Switch
                value={settings.confirmDelete}
                onValueChange={(value) => updateSetting('confirmDelete', value)}
                trackColor={{ false: '#444444', true: theme.colors.primary }}
                thumbColor={settings.confirmDelete ? theme.colors.accent : '#999999'}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>

          {isSaving && (
            <View style={styles.saveIndicator}>
              <Text style={styles.saveIndicatorText}>✓ Saved</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundLight,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  backText: {
    color: theme.colors.accent,
    fontSize: theme.typography.bodyMedium,
  },
  title: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.heading4,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingInfoFull: {
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: theme.typography.bodyMedium,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: theme.spacing.sm,
  },
  resetButton: {
    backgroundColor: '#ef444420',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: theme.typography.button,
    fontWeight: '600',
    color: '#ef4444',
  },
  saveIndicator: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  saveIndicatorText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: theme.typography.bodySmall,
  },
  orientationButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  orientationButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orientationButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.accent,
  },
  orientationButtonText: {
    fontSize: theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  orientationButtonTextActive: {
    color: theme.colors.text,
  },
});
