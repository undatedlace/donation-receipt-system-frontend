import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, radius, shadows, spacing } from '../../theme/theme';

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

interface PageProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps['refreshControl'];
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
}

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

interface BadgeProps {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  compact?: boolean;
}

interface FieldGroupProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface InputFieldProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

const badgeToneStyles: Record<Tone, { container: ViewStyle; text: TextStyle }> = {
  default: {
    container: { backgroundColor: palette.surfaceStrong, borderColor: palette.border },
    text: { color: palette.textMuted },
  },
  primary: {
    container: { backgroundColor: palette.primarySoft, borderColor: '#CFE7D6' },
    text: { color: palette.primaryDark },
  },
  success: {
    container: { backgroundColor: palette.accentSoft, borderColor: '#B8ECD7' },
    text: { color: palette.primaryDark },
  },
  warning: {
    container: { backgroundColor: palette.warningSoft, borderColor: '#F8DDA9' },
    text: { color: '#92400E' },
  },
  danger: {
    container: { backgroundColor: palette.dangerSoft, borderColor: '#F3C8C8' },
    text: { color: '#991B1B' },
  },
  info: {
    container: { backgroundColor: palette.infoSoft, borderColor: '#A8EAE1' },
    text: { color: palette.info },
  },
};

export function Page({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, style]}>
      {children}
    </SafeAreaView>
  );
}

export function PageScroll({
  children,
  style,
  contentContainerStyle,
  refreshControl,
  keyboardShouldPersistTaps = 'handled',
}: PageProps) {
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, style]}>
      <ScrollView
        refreshControl={refreshControl}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={[styles.pageContent, contentContainerStyle]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
  compact = false,
}: PageHeaderProps) {
  return (
    <View style={[styles.headerCard, compact && styles.headerCompact]}>
      <View style={styles.headerOrbTop} />
      <View style={styles.headerOrbBottom} />
      <View style={styles.headerContent}>
        <View style={styles.headerTextWrap}>
          {eyebrow ? <Text style={styles.headerEyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {trailing ? <View style={styles.headerTrailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

export function SurfaceCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeading({
  title,
  caption,
  action,
}: {
  title: string;
  caption?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Badge({ label, tone = 'default', style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.badge, badgeToneStyles[tone].container, style]}>
      <Text style={[styles.badgeText, badgeToneStyles[tone].text, textStyle]}>{label}</Text>
    </View>
  );
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  style,
  textStyle,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyle = buttonStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={isDisabled}
      style={[
        styles.buttonBase,
        variantStyle.container,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variantStyle.loaderColor} />
      ) : (
        <Text style={[styles.buttonText, variantStyle.text, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function FieldGroup({ label, hint, children, style }: FieldGroupProps) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function InputField({ style, multiline, ...props }: InputFieldProps) {
  return (
    <TextInput
      placeholderTextColor={palette.textSoft}
      style={[styles.input, multiline && styles.inputMultiline, style]}
      multiline={multiline}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const buttonStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; loaderColor: string }
> = {
  primary: {
    container: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
      borderWidth: 1,
    },
    text: { color: palette.surface },
    loaderColor: palette.surface,
  },
  secondary: {
    container: {
      backgroundColor: palette.primarySoft,
      borderColor: '#CFE7D6',
      borderWidth: 1,
    },
    text: { color: palette.primaryDark },
    loaderColor: palette.primaryDark,
  },
  ghost: {
    container: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderWidth: 1,
    },
    text: { color: palette.text },
    loaderColor: palette.text,
  },
  danger: {
    container: {
      backgroundColor: palette.danger,
      borderColor: palette.danger,
      borderWidth: 1,
    },
    text: { color: palette.surface },
    loaderColor: palette.surface,
  },
  success: {
    container: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
      borderWidth: 1,
    },
    text: { color: palette.primaryDark },
    loaderColor: palette.primaryDark,
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  pageContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  headerCard: {
    backgroundColor: palette.primaryDark,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  headerCompact: {
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  headerOrbTop: {
    position: 'absolute',
    top: -32,
    right: -18,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  headerOrbBottom: {
    position: 'absolute',
    bottom: -48,
    left: -14,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(52,211,153,0.20)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerEyebrow: {
    color: '#BBF7D0',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: palette.surface,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 33,
  },
  headerSubtitle: {
    color: 'rgba(244, 248, 243, 0.82)',
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  headerTrailing: {
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeadingText: {
    flex: 1,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCaption: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  buttonBase: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldHint: {
    color: palette.textSoft,
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: palette.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
  },
});
