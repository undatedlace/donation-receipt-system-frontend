import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  ScrollViewProps,
  StatusBar,
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
  header?: React.ReactNode;
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
  leading?: React.ReactNode;
  compact?: boolean;
  align?: 'center' | 'left';
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
    container: { backgroundColor: palette.primarySoft, borderColor: palette.accentSoft },
    text: { color: palette.primaryDark },
  },
  success: {
    container: { backgroundColor: palette.primarySurface, borderColor: palette.accentSoft },
    text: { color: palette.primaryDark },
  },
  warning: {
    container: { backgroundColor: palette.warningSoft, borderColor: '#F3D08A' },
    text: { color: '#995C00' },
  },
  danger: {
    container: { backgroundColor: palette.dangerSoft, borderColor: '#F2B2B2' },
    text: { color: '#A01919' },
  },
  info: {
    container: { backgroundColor: palette.infoSoft, borderColor: '#9EE5D2' },
    text: { color: palette.info },
  },
};

const buttonVariants: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; loaderColor: string }
> = {
  primary: {
    container: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
      borderWidth: 1,
      ...shadows.sm,
    },
    text: { color: '#FFFFFF' },
    loaderColor: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: palette.surfaceMuted,
      borderColor: palette.borderStrong,
      borderWidth: 1,
    },
    text: { color: palette.primaryDark },
    loaderColor: palette.primaryDark,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: palette.border,
      borderWidth: 1,
    },
    text: { color: palette.primaryDark },
    loaderColor: palette.primaryDark,
  },
  danger: {
    container: {
      backgroundColor: palette.dangerSoft,
      borderColor: '#F2B2B2',
      borderWidth: 1,
    },
    text: { color: '#A01919' },
    loaderColor: '#A01919',
  },
  success: {
    container: {
      backgroundColor: palette.primarySoft,
      borderColor: palette.accentSoft,
      borderWidth: 1,
    },
    text: { color: palette.primaryDark },
    loaderColor: palette.primaryDark,
  },
};

export function Page({
  children,
  style,
  header,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  header?: React.ReactNode;
}) {
  const hasHeader = Boolean(header);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, hasHeader ? styles.safeAreaGreen : null, style]}>
      <StatusBar
        barStyle={hasHeader ? 'light-content' : 'dark-content'}
        backgroundColor={hasHeader ? palette.primary : palette.background}
      />
      {header}
      <View style={[styles.pageBody, hasHeader ? styles.pageBodyRaised : null]}>{children}</View>
    </SafeAreaView>
  );
}

export function PageScroll({
  children,
  style,
  contentContainerStyle,
  refreshControl,
  keyboardShouldPersistTaps = 'handled',
  header,
}: PageProps) {
  const hasHeader = Boolean(header);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, hasHeader ? styles.safeAreaGreen : null, style]}>
      <StatusBar
        barStyle={hasHeader ? 'light-content' : 'dark-content'}
        backgroundColor={hasHeader ? palette.primary : palette.background}
      />
      {header}
      <View style={[styles.pageBody, hasHeader ? styles.pageBodyRaised : null]}>
        <ScrollView
          refreshControl={refreshControl}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          contentContainerStyle={[
            styles.pageContent,
            hasHeader ? styles.pageContentRaised : styles.pageContentPlain,
            contentContainerStyle,
          ]}>
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
  leading,
  compact = false,
  align = 'center',
}: PageHeaderProps) {
  return (
    <View style={[styles.headerWrap, compact ? styles.headerWrapCompact : null]}>
      <View style={[styles.headerRow, compact ? styles.headerRowCompact : null]}>
        {leading ? <View style={styles.headerLeading}>{leading}</View> : null}
        <View
          style={[
            styles.headerTextWrap,
            align === 'left' ? styles.headerTextWrapLeft : styles.headerTextWrapCenter,
          ]}>
          {eyebrow ? (
            <Text style={[styles.headerEyebrow, align === 'left' ? styles.headerTextLeft : null]}>
              {eyebrow}
            </Text>
          ) : null}
          <Text
            style={[
              styles.headerTitle,
              compact ? styles.headerTitleCompact : null,
              align === 'left' ? styles.headerTextLeft : null,
            ]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.headerSubtitle, align === 'left' ? styles.headerTextLeft : null]}>
              {subtitle}
            </Text>
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
  const variantStyle = buttonVariants[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={isDisabled}
      style={[
        styles.buttonBase,
        variantStyle.container,
        isDisabled ? styles.buttonDisabled : null,
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
      style={[styles.input, multiline ? styles.inputMultiline : null, style]}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  safeAreaGreen: {
    backgroundColor: palette.primary,
  },
  pageBody: {
    flex: 1,
    backgroundColor: palette.background,
  },
  pageBodyRaised: {
    marginTop: -radius.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'visible',
  },
  pageContent: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 122,
  },
  pageContentRaised: {
    paddingTop: spacing.lg,
  },
  pageContentPlain: {
    paddingTop: spacing.md,
  },

  headerWrap: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: 52,
  },
  headerWrapCompact: {
    paddingTop: spacing.sm,
    paddingBottom: 42,
  },
  headerRow: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRowCompact: {
    minHeight: 58,
  },
  headerTextWrap: {
    gap: 4,
  },
  headerTextWrapCenter: {
    alignItems: 'center',
    maxWidth: '80%',
  },
  headerTextWrapLeft: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    maxWidth: '100%',
  },
  headerEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerTitleCompact: {
    fontSize: 17,
    lineHeight: 22,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    maxWidth: 320,
    textAlign: 'center',
  },
  headerLeading: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  headerTrailing: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerTextLeft: {
    textAlign: 'left',
  },

  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    ...shadows.md,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionCaption: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  buttonBase: {
    minHeight: 46,
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
    fontWeight: '700',
    letterSpacing: 0.1,
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
    fontWeight: '600',
  },
  fieldHint: {
    color: palette.textSoft,
    fontSize: 11,
  },

  input: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: palette.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },

  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 52,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: palette.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 19,
  },
});
