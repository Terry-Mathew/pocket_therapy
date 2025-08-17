/**
 * Modal Component for PocketTherapy
 * 
 * Therapeutic modal component with gentle animations and accessibility.
 * Supports different sizes and overlay interactions.
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { theme, getElevation } from '@constants/theme';
// import { triggerHaptic } from '../../utils'; // Commented out for now

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  dismissOnOverlayPress?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  size = 'medium',
  dismissOnOverlayPress = true,
  showCloseButton = true,
  children,
  style,
  testID,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Gentle entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animation.duration.slow,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Gentle exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: theme.animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: theme.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleOverlayPress = async () => {
    if (!dismissOnOverlayPress) return;
    
    await triggerHaptic('light');
    onClose();
  };

  const handleClosePress = async () => {
    await triggerHaptic('light');
    onClose();
  };

  const getModalStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.components.modal.background,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.components.modal.border,
      ...getElevation('large'),
    };

    switch (size) {
      case 'small':
        return {
          ...baseStyle,
          width: screenWidth * 0.8,
          maxHeight: screenHeight * 0.4,
        };
      case 'large':
        return {
          ...baseStyle,
          width: screenWidth * 0.95,
          maxHeight: screenHeight * 0.8,
        };
      case 'fullscreen':
        return {
          ...baseStyle,
          width: screenWidth,
          height: screenHeight,
          borderRadius: 0,
          margin: 0,
        };
      default: // medium
        return {
          ...baseStyle,
          width: screenWidth * 0.9,
          maxHeight: screenHeight * 0.6,
        };
    }
  };

  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {title && (
            <Text
              style={styles.title}
              testID={`${testID}-title`}
              accessibilityRole="header"
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={styles.subtitle}
              testID={`${testID}-subtitle`}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {showCloseButton && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClosePress}
            testID={`${testID}-close`}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            accessibilityHint="Tap to close this dialog"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.modalContainer,
            getModalStyle(),
            {
              transform: [{ scale: scaleAnim }],
            },
            style,
          ]}
        >
          {renderHeader()}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

// Specialized modal variants for common use cases
export const ConfirmModal: React.FC<Omit<ModalProps, 'children'> & {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  onClose,
  ...modalProps
}) => (
  <Modal {...modalProps} onClose={onCancel || onClose} size="small">
    <Text style={styles.confirmMessage}>{message}</Text>
    <View style={styles.confirmButtons}>
      <TouchableOpacity
        style={[styles.confirmButton, styles.cancelButton]}
        onPress={onCancel || onClose}
      >
        <Text style={styles.cancelButtonText}>{cancelText}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.confirmButton,
          destructive ? styles.destructiveButton : styles.primaryButton,
        ]}
        onPress={onConfirm}
      >
        <Text
          style={
            destructive ? styles.destructiveButtonText : styles.primaryButtonText
          }
        >
          {confirmText}
        </Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.components.modal.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    margin: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    ...theme.typography.styles.h3,
    color: theme.colors.neutral.charcoal,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.grey,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.neutral.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.neutral.grey,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  confirmMessage: {
    ...theme.typography.styles.body,
    color: theme.colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.neutral.lightGrey,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.sage,
  },
  destructiveButton: {
    backgroundColor: theme.colors.semantic.error.primary,
  },
  cancelButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.neutral.charcoal,
  },
  primaryButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.neutral.white,
  },
  destructiveButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.neutral.white,
  },
});

export default Modal;
