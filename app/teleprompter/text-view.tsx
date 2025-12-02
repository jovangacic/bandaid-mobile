import Slider from '@react-native-community/slider';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSettings } from '../context/SettingsContext';
import { useTexts } from '../context/TextContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

export default function TextView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { texts, updateText } = useTexts();
  const { settings } = useSettings();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(true); // Auto-scroll by default
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const wasScrollingBeforeDragRef = useRef(false); // Track if autoscrolling was active before manual scroll
  const baseFontSizeRef = useRef(24);
  const [tempFontSize, setTempFontSize] = useState<number | null>(null);
  const [tempSpeed, setTempSpeed] = useState<number | null>(null);
  const speedUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find the text by id and current index
  const currentIndex = texts.findIndex(t => t.id === id);
  const text = texts[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < texts.length - 1;

  // Update base font size ref when text changes
  useEffect(() => {
    if (text) {
      baseFontSizeRef.current = text.fontSize || 24;
    }
  }, [text?.id]);
  
  // Check if content overflows
  const isScrollable = contentHeight > scrollViewHeight;

  useEffect(() => {
    // Hide status bar for fullscreen experience
    StatusBar.setHidden(true);

    // Keep screen awake if setting is enabled
    if (settings.keepScreenOn) {
      activateKeepAwakeAsync();
    }

    return () => {
      StatusBar.setHidden(false);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      // Deactivate keep awake when leaving
      if (settings.keepScreenOn) {
        deactivateKeepAwake();
      }
    };
  }, [settings.keepScreenOn]);

  useEffect(() => {
    if (text && isScrolling) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => {
      stopAutoScroll();
    };
  }, [isScrolling, text]);

  const startAutoScroll = () => {
    if (!text) return;
    
    stopAutoScroll(); // Clear any existing interval

    // Calculate scroll speed: scrollSpeed ranges from 1-20
    // Lower scrollSpeed = slower scrolling (higher interval between scrolls)
    // Higher scrollSpeed = faster scrolling (lower interval)
    const baseSpeed = 50; // Base interval in ms
    const speedMultiplier = 21 - text.scrollSpeed; // Invert so higher number = faster
    const intervalMs = baseSpeed * (speedMultiplier / 10);
    
    scrollIntervalRef.current = setInterval(() => {
      setScrollPosition(prev => {
        const newPosition = prev + 1; // Scroll 1 pixel at a time for smooth scrolling
        
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: newPosition,
            animated: false, // Use false for smoother continuous scrolling
          });
        }
        
        return newPosition;
      });
    }, intervalMs);
  };

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const toggleScrolling = () => {
    setIsScrolling(prev => !prev);
  };

  const handleTouchStart = (event: any) => {
    touchStartYRef.current = event.nativeEvent.pageY;
    touchStartXRef.current = event.nativeEvent.pageX;
    hasDraggedRef.current = false;
  };

  const handleTouchMove = () => {
    hasDraggedRef.current = true;
  };

  const handleTouchEnd = (event: any) => {
    const touchEndY = event.nativeEvent.pageY;
    const touchEndX = event.nativeEvent.pageX;
    const touchDeltaY = Math.abs(touchEndY - touchStartYRef.current);
    const touchDeltaX = touchEndX - touchStartXRef.current;
    const absTouchDeltaX = Math.abs(touchDeltaX);
    
    // Check if it's a horizontal swipe (more horizontal than vertical movement)
    if (hasDraggedRef.current && absTouchDeltaX > 50 && absTouchDeltaX > touchDeltaY) {
      // Swipe right - go to previous text
      if (touchDeltaX > 0 && hasPrevious) {
        stopAutoScroll();
        router.replace(`/teleprompter/text-view?id=${texts[currentIndex - 1].id}` as any);
        return;
      }
      // Swipe left - go to next text
      if (touchDeltaX < 0 && hasNext) {
        stopAutoScroll();
        router.replace(`/teleprompter/text-view?id=${texts[currentIndex + 1].id}` as any);
        return;
      }
    }
    
    // If user didn't drag (just tapped), toggle play/pause
    if (!hasDraggedRef.current && touchDeltaY < 10) {
      toggleScrolling();
    }
  };

  const handleScrollBeginDrag = () => {
    // Remember if autoscrolling was active before manual scroll
    wasScrollingBeforeDragRef.current = isScrolling;
    // Pause auto-scroll when user starts dragging
    if (isScrolling) {
      setIsScrolling(false);
    }
  };

  const handleScrollEndDrag = () => {
    // Resume autoscrolling if it was active before manual scroll
    if (wasScrollingBeforeDragRef.current) {
      setIsScrolling(true);
    }
  };

  const handleScroll = (event: any) => {
    // Always sync scroll position with current scroll offset
    const currentY = event.nativeEvent.contentOffset.y;
    setScrollPosition(currentY);
  };

  const handleClose = () => {
    stopAutoScroll();
    router.back();
  };

  const resetScroll = () => {
    setScrollPosition(0);
    setIsScrolling(false);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (!text) return;
    
    // Update temp speed for immediate visual feedback
    setTempSpeed(newSpeed);
    
    // Clear any existing timeout
    if (speedUpdateTimeoutRef.current) {
      clearTimeout(speedUpdateTimeoutRef.current);
    }
    
    // Debounce the actual save
    speedUpdateTimeoutRef.current = setTimeout(async () => {
      const wasAutoScrolling = isScrolling;
      // Pause scrolling during speed change
      if (wasAutoScrolling) {
        setIsScrolling(false);
      }
      
      // Update the text with new speed
      await updateText(text.id, { ...text, scrollSpeed: newSpeed });
      setTempSpeed(null);
      
      // Resume scrolling if it was active
      if (wasAutoScrolling) {
        setIsScrolling(true);
      }
    }, 500);
  };

  const updateTempFontSize = (size: number) => {
    setTempFontSize(size);
  };

  const saveFontSize = async (newSize: number) => {
    if (!text || newSize === text.fontSize) return;
    try {
      await updateText(text.id, { ...text, fontSize: newSize });
      baseFontSizeRef.current = newSize;
    } catch (error) {
      console.error('Error updating font size:', error);
    }
  };

  const clearTempFontSize = () => {
    setTempFontSize(null);
  };

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      if (text) {
        baseFontSizeRef.current = text.fontSize || 24;
      }
    })
    .onUpdate((event) => {
      if (!text) return;
      
      const scale = event.scale;
      const newFontSize = Math.round(baseFontSizeRef.current * scale);
      
      // Clamp font size between 16 and 48
      const clampedFontSize = Math.max(16, Math.min(48, newFontSize));
      
      // Update temp state for immediate visual feedback
      runOnJS(updateTempFontSize)(clampedFontSize);
    })
    .onEnd(() => {
      const finalSize = tempFontSize;
      if (finalSize !== null) {
        runOnJS(saveFontSize)(finalSize);
      }
      runOnJS(clearTempFontSize)();
    });

  if (!text) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Text not found</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Control Bar - shows on top */}
      <View style={styles.controlBar}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={handleClose} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerSection}>
          <Text style={styles.titleText} numberOfLines={1}>
            {text.title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity onPress={resetScroll} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>↺</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleScrolling} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>
              {isScrolling ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Teleprompter Content */}
      <View 
        style={[styles.touchableArea, settings.mirrorMode && styles.mirrorContainer]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <GestureDetector gesture={pinchGesture}>
          <ScrollView
            {...({ ref: scrollViewRef } as any)}
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={isScrollable} // Only allow scrolling if content overflows
            onContentSizeChange={(width, height) => setContentHeight(height)}
            onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <Text style={[styles.contentText, { 
              fontSize: tempFontSize || text.fontSize || 24, 
              lineHeight: (tempFontSize || text.fontSize || 24) * 1.5 
            }]}>
              {text.content}
            </Text>
            
            {/* Extra space at bottom so text can scroll completely off screen */}
            {isScrollable && <View style={styles.bottomSpacer} />}
          </ScrollView>
        </GestureDetector>
      </View>

      {/* Speed controls */}
      <View
        style={[
          styles.speedContainer,
          { opacity: 0.8 }
        ]}
      >
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderFill, 
              { width: `${(((tempSpeed || text.scrollSpeed) - 1) / 19) * 100}%` }
            ]} 
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.speedLabel}>Speed</Text>
            <Text style={styles.speedValue}>{tempSpeed || text.scrollSpeed}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={tempSpeed || text.scrollSpeed}
            onValueChange={handleSpeedChange}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor="transparent"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftSection: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerSection: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 24,
    maxWidth: 24,
    textAlign: 'center',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  touchableArea: {
    flex: 1,
  },
  mirrorContainer: {
    transform: [{ scaleX: -1 }],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: '100%',
  },
  contentText: {
    color: '#ffffff',
    lineHeight: 45,
    textAlign: 'left',
  },
  bottomSpacer: {
    height: SCREEN_HEIGHT,
  },
  speedContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: isTablet ? SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.5,
  },
  sliderTrack: {
    position: 'relative',
    width: '100%',
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#8b5cf6',
    borderRadius: 18,
  },
  sliderLabels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  speedLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  speedValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: 36,
    zIndex: 2,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 20,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
