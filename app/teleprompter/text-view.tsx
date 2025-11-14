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
import { useSettings } from '../context/SettingsContext';
import { useTexts } from '../context/TextContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TextView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { texts } = useTexts();
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

  // Find the text by id and current index
  const currentIndex = texts.findIndex(t => t.id === id);
  const text = texts[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < texts.length - 1;
  
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
    // Pause auto-scroll when user starts dragging
    if (isScrolling) {
      setIsScrolling(false);
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
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isScrollable} // Only allow scrolling if content overflows
          onContentSizeChange={(width, height) => setContentHeight(height)}
          onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Text style={[styles.contentText, { fontSize: text.fontSize || 24, lineHeight: (text.fontSize || 24) * 1.5 }]}>
            {text.content}
          </Text>
          
          {/* Extra space at bottom so text can scroll completely off screen */}
          {isScrollable && <View style={styles.bottomSpacer} />}
        </ScrollView>
      </View>

      {/* Speed indicator */}
      <View style={styles.speedIndicator}>
        <Text style={styles.speedText}>Speed: {text.scrollSpeed}</Text>
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
  speedIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  speedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
