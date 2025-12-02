import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FormHeader from '../components/FormHeader';
import Layout from '../components/Layout';
import SideMenu from '../components/SideMenu';
import { DEFAULT_REMINDER_SETTINGS, Gig } from '../models/Gig';
import { gigStorage } from '../services/gigStorage';
import theme from '../theme/colors';
import { showErrorToast, showSuccessToast } from '../utils/toast';

const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6, 12];

export default function AddGig() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const gigId = params.gigId as string | undefined;
  const isEditMode = !!gigId;

  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState(DEFAULT_REMINDER_SETTINGS.enabled);
  const [sevenDaysBefore, setSevenDaysBefore] = useState(DEFAULT_REMINDER_SETTINGS.sevenDaysBefore);
  const [oneDayBefore, setOneDayBefore] = useState(DEFAULT_REMINDER_SETTINGS.oneDayBefore);
  const [selectedHours, setSelectedHours] = useState<number[]>(DEFAULT_REMINDER_SETTINGS.hoursBeforeOptions);
  const [recurring, setRecurring] = useState(DEFAULT_REMINDER_SETTINGS.recurring);
  const [recurringIntervalDays, setRecurringIntervalDays] = useState(DEFAULT_REMINDER_SETTINGS.recurringIntervalDays);

  useEffect(() => {
    if (isEditMode) {
      loadGig();
    }
  }, [gigId]);

  const loadGig = async () => {
    try {
      const gigs = await gigStorage.getAllGigs();
      const foundGig = gigs.find((g) => g.id === gigId);

      if (foundGig) {
        setTitle(foundGig.title);
        setDescription(foundGig.description);

        // Parse date and time
        const gigDate = new Date(foundGig.date);
        const [hours, minutes] = foundGig.time.split(':');
        const gigTime = new Date();
        gigTime.setHours(parseInt(hours, 10));
        gigTime.setMinutes(parseInt(minutes, 10));

        setDate(gigDate);
        setTime(gigTime);

        // Set reminder settings
        setReminderEnabled(foundGig.reminderSettings.enabled);
        setSevenDaysBefore(foundGig.reminderSettings.sevenDaysBefore);
        setOneDayBefore(foundGig.reminderSettings.oneDayBefore);
        setSelectedHours(foundGig.reminderSettings.hoursBeforeOptions);
        setRecurring(foundGig.reminderSettings.recurring);
        setRecurringIntervalDays(foundGig.reminderSettings.recurringIntervalDays);
      } else {
        Alert.alert('Error', 'Gig not found', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error loading gig:', error);
      Alert.alert('Error', 'Failed to load gig');
    } finally {
      setLoading(false);
    }
  };

  const toggleHourOption = (hours: number) => {
    setSelectedHours((prev) =>
      prev.includes(hours) ? prev.filter((h) => h !== hours) : [...prev, hours]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showErrorToast('Please enter a title for the gig', 'Validation Error');
      return;
    }

    if (saving) return; // Prevent double-tap

    setSaving(true);
    try {
      const gig: Gig = {
        id: isEditMode ? gigId : Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        time: time.toTimeString().slice(0, 5), // HH:mm
        reminderSettings: {
          enabled: reminderEnabled,
          sevenDaysBefore,
          oneDayBefore,
          hoursBeforeOptions: selectedHours,
          recurring,
          recurringIntervalDays,
        },
        createdAt: isEditMode ? (await gigStorage.getAllGigs()).find(g => g.id === gigId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await gigStorage.saveGig(gig);
      showSuccessToast(`Gig ${isEditMode ? 'updated' : 'created'} successfully`);
      router.back();
    } catch (error) {
      console.error('Error saving gig:', error);
      showErrorToast('Failed to save gig');
      setSaving(false);
    }
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleCancel = () => {
    const hasChanges = title || description;

    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <Layout useSafeArea={true}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        <FormHeader
          title={isEditMode ? 'Edit Gig' : 'Add Gig'}
          onCancel={handleCancel}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gig Details</Text>

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter gig title"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter gig description (optional)"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Date Picker */}
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                📅 {date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker */}
            <Text style={styles.label}>Time *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                🕐 {time.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>

          {/* Reminder Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reminders</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#444444', true: theme.colors.accent }}
                thumbColor={reminderEnabled ? '#FFFFFF' : '#999999'}
              />
            </View>

            {reminderEnabled && (
              <>
                <View style={styles.reminderOption}>
                  <Text style={styles.reminderLabel}>7 days before</Text>
                  <Switch
                    value={sevenDaysBefore}
                    onValueChange={setSevenDaysBefore}
                    trackColor={{ false: '#444444', true: theme.colors.accent }}
                    thumbColor={sevenDaysBefore ? '#FFFFFF' : '#999999'}
                  />
                </View>

                <View style={styles.reminderOption}>
                  <Text style={styles.reminderLabel}>1 day before</Text>
                  <Switch
                    value={oneDayBefore}
                    onValueChange={setOneDayBefore}
                    trackColor={{ false: '#444444', true: theme.colors.accent }}
                    thumbColor={oneDayBefore ? '#FFFFFF' : '#999999'}
                  />
                </View>

                <Text style={styles.reminderLabel}>Hours before:</Text>
                <View style={styles.hoursGrid}>
                  {HOURS_OPTIONS.map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[
                        styles.hourButton,
                        selectedHours.includes(hours) && styles.hourButtonSelected,
                      ]}
                      onPress={() => toggleHourOption(hours)}
                    >
                      <Text
                        style={[
                          styles.hourButtonText,
                          selectedHours.includes(hours) && styles.hourButtonTextSelected,
                        ]}
                      >
                        {hours}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Recurring Gig */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recurring Gig</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Repeat this gig</Text>
              <Switch
                value={recurring}
                onValueChange={setRecurring}
                trackColor={{ false: '#444444', true: theme.colors.primary }}
                thumbColor={recurring ? theme.colors.accent : '#999999'}
              />
            </View>

            {recurring && (
              <>
                <Text style={styles.settingDescription}>
                  Automatically create a new gig every {recurringIntervalDays} day{recurringIntervalDays !== 1 ? 's' : ''}
                </Text>
                
                <Text style={styles.label}>Interval</Text>
                <View style={styles.intervalOptions}>
                  {[
                    { days: 1, label: 'Daily' },
                    { days: 7, label: 'Weekly' },
                    { days: 14, label: 'Biweekly' },
                    { days: 30, label: 'Monthly' },
                  ].map(({ days, label }) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.intervalButton,
                        recurringIntervalDays === days && styles.intervalButtonSelected,
                      ]}
                      onPress={() => setRecurringIntervalDays(days)}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          recurringIntervalDays === days && styles.intervalButtonTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={[styles.saveButtonText, styles.savingText]}>
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditMode ? 'Update Gig' : 'Save Gig'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.bodyMedium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.heading4,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.backgroundLight,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  dateTimeButton: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.backgroundLight,
  },
  dateTimeText: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  reminderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundLight,
  },
  reminderLabel: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  hourButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.backgroundLight,
  },
  hourButtonSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  hourButtonText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.text,
  },
  hourButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  settingLabel: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.bodySmall * 1.4,
  },
  intervalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  intervalButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.backgroundLight,
    alignItems: 'center',
  },
  intervalButtonSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  intervalButtonText: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  intervalButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
    opacity: 0.6,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: theme.typography.bodyLarge,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  savingText: {
    marginLeft: theme.spacing.sm,
  },
});
