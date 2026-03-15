import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Badge,
  Button,
  EmptyState,
  FieldGroup,
  InputField,
  Page,
  PageHeader,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useUsers } from '../../hooks/useUsers';
import { palette, radius, spacing } from '../../theme/theme';

const ROLES = ['admin', 'user', 'internal-admin'];
const ROLE_TONES: Record<string, 'danger' | 'primary' | 'info'> = {
  admin: 'danger',
  user: 'primary',
  'internal-admin': 'info',
};

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

const emptyAdd = { firstName: '', lastName: '', email: '', password: '', roles: [] as string[] };

function RoleSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (roles: string[]) => void;
}) {
  const toggle = (role: string) =>
    onChange(selected.includes(role) ? selected.filter(value => value !== role) : [...selected, role]);

  return (
    <View style={styles.rolesRow}>
      {ROLES.map(role => {
        const active = selected.includes(role);
        return (
          <TouchableOpacity
            key={role}
            activeOpacity={0.88}
            style={[styles.roleChip, active && styles.roleChipActive]}
            onPress={() => toggle(role)}>
            <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{role}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function UserSheet({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {children}
            <View style={styles.sheetSpacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function UsersScreen() {
  const { users, loading, refreshing, fetchUsers, refresh, addUser, editUser, removeUser } = useUsers();

  const [addVisible, setAddVisible] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyAdd });
  const [addLoading, setAddLoading] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers]),
  );

  const handleAdd = async () => {
    const { firstName, lastName, email, password, roles } = addForm;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Validation', 'All fields are required.');
    }

    if (roles.length === 0) {
      return Alert.alert('Validation', 'Select at least one role.');
    }

    setAddLoading(true);

    try {
      await addUser({ firstName, lastName, email, password, roles });
      setAddVisible(false);
      setAddForm({ ...emptyAdd });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditFirst(user.firstName);
    setEditLast(user.lastName);
    setEditRoles([...(user.roles ?? [])]);
    setEditVisible(true);
  };

  const handleEdit = async () => {
    if (!editTarget) {
      return;
    }

    if (editRoles.length === 0) {
      return Alert.alert('Validation', 'Select at least one role.');
    }

    setEditLoading(true);

    try {
      await editUser(editTarget._id, {
        firstName: editFirst.trim(),
        lastName: editLast.trim(),
        roles: editRoles,
      });
      setEditVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (user: UserItem) => {
    Alert.alert(
      'Delete User',
      `Delete ${user.firstName} ${user.lastName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeUser(user._id);
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message ?? 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <PageHeader
        eyebrow="Users"
        title="Manage staff access and role assignments."
        subtitle="Add new accounts, update permissions, and keep the team roster clean from one admin view."
        trailing={<Badge label={`${users.length} total`} tone="primary" />}
      />

      <SurfaceCard style={styles.toolbarCard}>
        <SectionHeading title="Team members" caption="Role-based access control" />
        <Button label="Add user" onPress={() => setAddVisible(true)} />
      </SurfaceCard>
    </View>
  );

  const renderUser = ({ item }: { item: UserItem }) => {
    const initials = `${item.firstName?.[0] ?? ''}${item.lastName?.[0] ?? ''}`.toUpperCase() || '?';

    return (
      <SurfaceCard style={styles.userCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.userBody}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>

          <View style={styles.badgesRow}>
            {(item.roles ?? []).map(role => (
              <Badge key={role} label={role} tone={ROLE_TONES[role] || 'primary'} />
            ))}
          </View>
        </View>

        <View style={styles.actionsColumn}>
          <Button label="Edit" variant="secondary" onPress={() => openEdit(item)} style={styles.inlineButton} />
          <Button label="Delete" variant="ghost" onPress={() => handleDelete(item)} style={styles.inlineButton} />
        </View>
      </SurfaceCard>
    );
  };

  if (loading) {
    return (
      <Page>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={renderUser}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No users found"
            subtitle="Create the first account to start assigning access and responsibilities."
          />
        }
        contentContainerStyle={styles.listContent}
        onRefresh={() => refresh()}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
      />

      <UserSheet
        visible={addVisible}
        title="Add new user"
        onClose={() => {
          setAddVisible(false);
          setAddForm({ ...emptyAdd });
        }}>
        <FieldGroup label="First Name">
          <InputField
            value={addForm.firstName}
            onChangeText={value => setAddForm(form => ({ ...form, firstName: value }))}
            placeholder="First name"
          />
        </FieldGroup>

        <FieldGroup label="Last Name">
          <InputField
            value={addForm.lastName}
            onChangeText={value => setAddForm(form => ({ ...form, lastName: value }))}
            placeholder="Last name"
          />
        </FieldGroup>

        <FieldGroup label="Email">
          <InputField
            value={addForm.email}
            onChangeText={value => setAddForm(form => ({ ...form, email: value }))}
            placeholder="user@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </FieldGroup>

        <FieldGroup label="Password">
          <InputField
            value={addForm.password}
            onChangeText={value => setAddForm(form => ({ ...form, password: value }))}
            placeholder="Password"
            secureTextEntry
          />
        </FieldGroup>

        <FieldGroup label="Roles">
          <RoleSelector
            selected={addForm.roles}
            onChange={roles => setAddForm(form => ({ ...form, roles }))}
          />
        </FieldGroup>

        <Button label="Create user" loading={addLoading} onPress={handleAdd} style={styles.sheetButton} />
        <Button
          label="Cancel"
          variant="ghost"
          onPress={() => {
            setAddVisible(false);
            setAddForm({ ...emptyAdd });
          }}
          style={styles.sheetSecondaryButton}
        />
      </UserSheet>

      <UserSheet visible={editVisible} title="Edit user" onClose={() => setEditVisible(false)}>
        <FieldGroup label="First Name">
          <InputField value={editFirst} onChangeText={setEditFirst} placeholder="First name" />
        </FieldGroup>

        <FieldGroup label="Last Name">
          <InputField value={editLast} onChangeText={setEditLast} placeholder="Last name" />
        </FieldGroup>

        <FieldGroup label="Roles">
          <RoleSelector selected={editRoles} onChange={setEditRoles} />
        </FieldGroup>

        <Button label="Save changes" loading={editLoading} onPress={handleEdit} style={styles.sheetButton} />
        <Button
          label="Cancel"
          variant="ghost"
          onPress={() => setEditVisible(false)}
          style={styles.sheetSecondaryButton}
        />
      </UserSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 126,
  },
  headerWrap: {
    marginBottom: spacing.lg,
  },
  toolbarCard: {
    marginTop: spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  userBody: {
    flex: 1,
  },
  userName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionsColumn: {
    gap: spacing.sm,
    width: 92,
  },
  inlineButton: {
    minHeight: 40,
    borderRadius: radius.sm,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: palette.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: palette.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.screen,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: palette.borderStrong,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  sheetSpacer: {
    height: spacing.xl,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleChip: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipActive: {
    backgroundColor: palette.primaryDark,
    borderColor: palette.primaryDark,
  },
  roleChipText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: palette.surface,
  },
  sheetButton: {
    marginTop: spacing.lg,
  },
  sheetSecondaryButton: {
    marginTop: spacing.sm,
  },
});
