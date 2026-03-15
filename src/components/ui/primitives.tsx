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
    container: { backgroundColor: palette.surfaceMuted, borderColor: palette.borderStrong },
    text: { color: palette.textMuted },
  },
  primary: {
    container: { backgroundColor: palette.primarySoft, borderColor: '#BBF7D0' },
    text: { color: palette.primaryDark },
  },
  success: {
    container: { backgroundColor: palette.accentSoft, borderColor: '#86EFAC' },
    text: { color: palette.primaryDark },
  },
  warning: {
    container: { backgroundColor: palette.warningSoft, borderColor: '#FDE68A' },
    text: { color: '#92400E' },
  },
  danger: {
    container: { backgroundColor: palette.dangerSoft, borderColor: '#FECACA' },
    text: { color: '#991B1B' },
  },
  info: {
    container: { backgroundColor: palette.infoSoft, borderColor: '#99F6E4' },
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

/**
 * Clean shadcn-style page header — no green card, just clear typography.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
  compact = false,
}: PageHeaderProps) {
  return (
    <View style={[styles.headerWrap, compact && styles.headerWrapCompact]}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          {eyebrow ? (
            <Text style={styles.headerEyebrow}>{eyebrow}</Text>
          ) : null}
          <Text style={[styles.headerTitle, compact && styles.headerTitleCompact]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          ) : null}
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
      <Text style={[styles.badgeText, badgeToneStyles[tone].text, textStyle]}>
        {label}
      </Text>
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
  const variantStyle = buttonVariants[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.buttonBase,
        variantStyle.container,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variantStyle.loaderColor} size="small" />
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

const buttonVariants: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; loaderColor: string }
> = {
  primary: {
    container: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
      borderWidth: 1,
    },
    text: { color: '#FFFFFF' },
    loaderColor: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderWidth: 1,
    },
    text: { color: palette.text },
    loaderColor: palette.text,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 1,
    },
    text: { color: palette.textMuted },
    loaderColor: palette.textMuted,
  },
  danger: {
    container: {
      backgroundColor: palette.danger,
      borderColor: palette.danger,
      borderWidth: 1,
    },
    text: { color: '#FFFFFF' },
    loaderColor: '#FFFFFF',
  },
  success: {
    container: {
      backgroundColor: palette.primarySoft,
      borderColor: '#BBF7D0',
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

  // ── Page header (clean text, no card) ───────────────────────────────────────
  headerWrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  headerWrapCompact: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerEyebrow: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  headerTitleCompact: {
    fontSize: 20,
    lineHeight: 26,
  },
  headerSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
    fontWeight: '400',
  },
  headerTrailing: {
    marginTop: 2,
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    ...shadows.sm,
  },

  // ── Section heading ─────────────────────────────────────────────────────────
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
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  sectionCaption: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '400',
  },

  // ── Badge ───────────────────────────────────────────────────────────────────
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // ── Button ──────────────────────────────────────────────────────────────────
  buttonBase: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // ── Field ───────────────────────────────────────────────────────────────────
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
    fontWeight: '500',
  },
  fieldHint: {
    color: palette.textSoft,
    fontSize: 12,
    fontWeight: '400',
  },

  // ── Input ───────────────────────────────────────────────────────────────────
  input: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: palette.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // ── Empty state ─────────────────────────────────────────────────────────────
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
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


