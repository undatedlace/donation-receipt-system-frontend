import React, { useMemo } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { type Palette, radius, spacing } from '../../theme/theme';

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

function makeBadgeToneStyles(p: Palette, isDark: boolean): Record<Tone, { container: ViewStyle; text: TextStyle }> {
  return {
    default: {
      container: { backgroundColor: p.surfaceMuted, borderColor: p.borderStrong },
      text: { color: p.textMuted },
    },
    primary: {
      container: { backgroundColor: p.primarySoft, borderColor: p.accentSoft },
      text: { color: isDark ? p.accent : p.primaryDark },
    },
    success: {
      container: { backgroundColor: p.primarySurface, borderColor: p.accentSoft },
      text: { color: isDark ? p.accent : p.primaryDark },
    },
    warning: {
      container: { backgroundColor: p.warningSoft, borderColor: isDark ? '#6B4A10' : '#F3D08A' },
      text: { color: isDark ? '#F59E0B' : '#995C00' },
    },
    danger: {
      container: { backgroundColor: p.dangerSoft, borderColor: isDark ? '#7B2020' : '#F2B2B2' },
      text: { color: isDark ? '#F87171' : '#A01919' },
    },
    info: {
      container: { backgroundColor: p.infoSoft, borderColor: isDark ? '#265E58' : '#9EE5D2' },
      text: { color: p.info },
    },
  };
}

type ShadowRecord = ReturnType<typeof import('../../theme/theme').createShadows>;

function makeButtonVariants(
  p: Palette,
  isDark: boolean,
  shadows: ShadowRecord,
): Record<ButtonVariant, { container: ViewStyle; text: TextStyle; loaderColor: string }> {
  return {
    primary: {
      container: {
        backgroundColor: p.primary,
        borderColor: p.primary,
        borderWidth: 1,
        ...shadows.sm,
      },
      text: { color: '#FFFFFF' },
      loaderColor: '#FFFFFF',
    },
    secondary: {
      container: {
        backgroundColor: p.surfaceMuted,
        borderColor: p.borderStrong,
        borderWidth: 1,
      },
      text: { color: isDark ? p.accent : p.primaryDark },
      loaderColor: isDark ? p.accent : p.primaryDark,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderColor: p.border,
        borderWidth: 1,
      },
      text: { color: isDark ? p.accent : p.primaryDark },
      loaderColor: isDark ? p.accent : p.primaryDark,
    },
    danger: {
      container: {
        backgroundColor: p.dangerSoft,
        borderColor: isDark ? '#7B2020' : '#F2B2B2',
        borderWidth: 1,
      },
      text: { color: isDark ? '#F87171' : '#A01919' },
      loaderColor: isDark ? '#F87171' : '#A01919',
    },
    success: {
      container: {
        backgroundColor: p.primarySoft,
        borderColor: p.accentSoft,
        borderWidth: 1,
      },
      text: { color: isDark ? p.accent : p.primaryDark },
      loaderColor: isDark ? p.accent : p.primaryDark,
    },
  };
}

function makeStyles(p: Palette, shadows: ShadowRecord, bottomInset: number = 0) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: p.background,
    },
    safeAreaGreen: {
      backgroundColor: p.primary,
    },
    pageBody: {
      flex: 1,
      backgroundColor: p.background,
    },
    pageBodyRaised: {
      marginTop: -radius.xl,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      overflow: 'visible',
    },
    pageContent: {
      paddingHorizontal: spacing.screen,
      paddingBottom: 122 + bottomInset,
    },
    pageContentRaised: {
      paddingTop: spacing.lg,
    },
    pageContentPlain: {
      paddingTop: spacing.md,
    },
    headerWrap: {
      backgroundColor: p.primary,
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
      backgroundColor: p.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: p.border,
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
      color: p.text,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    sectionCaption: {
      color: p.textMuted,
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
      color: p.text,
      fontSize: 13,
      fontWeight: '600',
    },
    fieldHint: {
      color: p.textSoft,
      fontSize: 11,
    },
    input: {
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: p.borderStrong,
      backgroundColor: p.surfaceMuted,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: p.text,
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
      color: p.text,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    emptySubtitle: {
      color: p.textMuted,
      fontSize: 13,
      textAlign: 'center',
      marginTop: spacing.sm,
      lineHeight: 19,
    },
  });
}

export function Page({
  children,
  style,
  header,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  header?: React.ReactNode;
}) {
  const { palette, shadows, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(palette, shadows, insets.bottom), [palette, shadows, insets.bottom]);
  const hasHeader = Boolean(header);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, hasHeader ? styles.safeAreaGreen : null, style]}>
      <StatusBar
        barStyle={hasHeader || isDark ? 'light-content' : 'dark-content'}
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
  const { palette, shadows, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(palette, shadows, insets.bottom), [palette, shadows, insets.bottom]);
  const hasHeader = Boolean(header);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, hasHeader ? styles.safeAreaGreen : null, style]}>
      <StatusBar
        barStyle={hasHeader || isDark ? 'light-content' : 'dark-content'}
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
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

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
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);
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
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

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
  const { palette, shadows, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);
  const toneStyles = useMemo(() => makeBadgeToneStyles(palette, isDark), [palette, isDark]);

  return (
    <View style={[styles.badge, toneStyles[tone].container, style]}>
      <Text style={[styles.badgeText, toneStyles[tone].text, textStyle]}>{label}</Text>
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
  const { palette, shadows, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);
  const variants = useMemo(() => makeButtonVariants(palette, isDark, shadows), [palette, isDark, shadows]);
  const variantStyle = variants[variant];
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
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

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
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

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
  const { palette, shadows } = useTheme();
  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}
