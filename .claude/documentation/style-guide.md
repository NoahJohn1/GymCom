# GymCom Style & UI Guide

> Derived from the HealthTracker reference app. All new components and screens must follow these patterns.

---

## 1. Color Palette

Colors are defined in `/constants/theme.ts` and accessed via the `useColors()` hook. Never hardcode color values — always use `colors.*` from the hook.

### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `colors.primary` | `#FF6B35` | Buttons, active states, accent |
| `colors.primaryLight` | `#FFF0EB` | Tinted backgrounds, inactive chips |
| `colors.background` | `#F7F8FA` | Screen backgrounds |
| `colors.card` | `#FFFFFF` | Cards, modals, inputs |
| `colors.text` | `#1A1A2E` | Primary text |
| `colors.textSecondary` | `#6B7280` | Labels, placeholders, secondary info |
| `colors.border` | `#E5E7EB` | Card borders, dividers, ring tracks |
| `colors.danger` | `#EF4444` | Delete actions, error states |
| `colors.dangerLight` | `#FEE2E2` | Danger tinted backgrounds |
| `colors.success` | `#22C55E` | Completion states, positive feedback |
| `colors.successLight` | `#DCFCE7` | Success tinted backgrounds |
| `colors.white` | `#FFFFFF` | Text on colored backgrounds |

### Dark Mode
| Token | Value |
|-------|-------|
| `colors.primary` | `#FF6B35` |
| `colors.primaryLight` | `#3D2010` |
| `colors.background` | `#1C1C1E` |
| `colors.card` | `#2C2C2E` |
| `colors.text` | `#F2F2F7` |
| `colors.textSecondary` | `#8E8E93` |
| `colors.border` | `#3A3A3C` |
| `colors.danger` | `#FF453A` |
| `colors.dangerLight` | `#3D1919` |
| `colors.success` | `#30D158` |
| `colors.successLight` | `#1A3D20` |

### Accent Color Presets
Users can change the primary accent from 6 options. Support all of them — never assume orange is the only primary.

| ID | Light | Dark |
|----|-------|------|
| `orange` (default) | `#FF6B35` | `#3D2010` |
| `red` | `#F44336` | `#3D1919` |
| `blue` | `#2196F3` | `#1A2D4A` |
| `green` | `#4CAF50` | `#1A3D20` |
| `purple` | `#9C27B0` | `#2A1A3D` |
| `teal` | `#009688` | `#1A3333` |

---

## 2. Typography

Defined in `Typography` from `/constants/theme.ts`. Always spread the typography constant and add `color` dynamically.

```typescript
Typography = {
  h1: { fontSize: 28, fontWeight: '700' },   // Page titles
  h2: { fontSize: 22, fontWeight: '600' },   // Section headers
  h3: { fontSize: 18, fontWeight: '600' },   // Card titles
  body: { fontSize: 16, fontWeight: '400' }, // Body text
  small: { fontSize: 13, fontWeight: '400' } // Helper/secondary text
}
```

### Weight Reference
- `'400'` — body, secondary info
- `'600'` — headers, buttons, emphasis
- `'700'` — page titles
- `'800'` — brand/logo text only

### Section Label Pattern
Uppercase, letter-spaced, secondary color:
```typescript
<Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
  SECTION TITLE
</Text>

sectionLabel: {
  ...Typography.small,
  fontWeight: '600',
  letterSpacing: 0.8,
  marginBottom: Spacing.sm,
  textTransform: 'uppercase'
}
```

---

## 3. Spacing

```typescript
Spacing = {
  xs: 4,   // Icon padding, tight gaps
  sm: 8,   // Between list items
  md: 16,  // Standard padding, section gaps
  lg: 24,  // Major section separation
  xl: 32   // Footer, large vertical gaps
}
```

---

## 4. Border Radius

```typescript
Radius = {
  sm: 8,   // Chips, tags, small elements
  md: 12,  // Cards, inputs, modals
  lg: 16   // Large containers, featured sections
}
```

Primary CTA buttons use `borderRadius: 14` (between `sm` and `md`).

---

## 5. Components

### Page Container
```typescript
<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
  <ScrollView contentContainerStyle={styles.scroll}>
    {/* content */}
  </ScrollView>
</SafeAreaView>

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xl }
});
```

### Primary CTA Button
```typescript
<TouchableOpacity
  style={[styles.btn, { backgroundColor: colors.primary }]}
  onPress={onPress}
>
  <Text style={{ ...Typography.h3, color: colors.white }}>Label</Text>
</TouchableOpacity>

btn: {
  paddingVertical: Spacing.md,
  borderRadius: 14,
  alignItems: 'center'
}
```

### Card
```typescript
<View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
  {/* content */}
</View>

card: {
  borderRadius: Radius.md,
  borderWidth: 1,
  padding: Spacing.md,
  marginBottom: Spacing.sm
}
```

### Chip / Filter Button
```typescript
// Active
{ backgroundColor: colors.primary, borderColor: colors.primary }
// text: colors.white, fontWeight: '600'

// Inactive
{ backgroundColor: colors.card, borderColor: colors.border }
// text: colors.text

// Inactive (tinted variant)
{ backgroundColor: colors.primaryLight }
// text: colors.primary, fontWeight: '600'

chip: {
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.xs,
  borderRadius: Radius.sm,
  borderWidth: 1
}
```

### Search / Text Input
```typescript
<View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
  <Ionicons name="search" size={18} color={colors.textSecondary} />
  <TextInput
    style={[styles.input, { color: colors.text }]}
    placeholderTextColor={colors.textSecondary}
  />
</View>

inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.sm,
  borderRadius: Radius.md,
  borderWidth: 1,
  paddingHorizontal: Spacing.md,
  height: 44
}
input: { flex: 1 }
```

### Icon Button
```typescript
<TouchableOpacity style={{ padding: Spacing.xs }} onPress={onPress}>
  <Ionicons name="pencil-outline" size={20} color={colors.primary} />
</TouchableOpacity>
```

---

## 6. Icons

Library: `@expo/vector-icons` — **Ionicons only**, outline variants preferred.

| Size | Usage |
|------|-------|
| 24px | Tab bar, navigation headers |
| 22px | List item icons |
| 20px | Card action icons (edit, delete) |
| 18px | Input field icons |

**Colors:**
- Primary actions → `colors.primary`
- Destructive actions → `colors.danger`
- Secondary/decorative → `colors.textSecondary`

**Style rule:** Use `-outline` suffix for all navigation and secondary icons. Use filled variants only for active/selected states where needed.

---

## 7. Navigation

### Tab Bar
```typescript
tabBar: {
  backgroundColor: colors.card,
  borderTopColor: colors.border
}
activeTintColor: colors.primary
inactiveTintColor: colors.textSecondary
```

### Screen Headers
```typescript
headerStyle: { backgroundColor: colors.card }
headerTintColor: colors.text
headerShadowVisible: false
```

No shadow — clean flat separation via background color.

---

## 8. Modals / Sheets

- `animationType="slide"` + `presentationStyle="pageSheet"` for action modals
- Wrap content in `<SafeAreaView style={{ backgroundColor: colors.background }}>`
- Header row: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `padding: Spacing.md`
- Close button: icon button with `Ionicons name="close"` at `colors.textSecondary`

---

## 9. Loading & Empty States

```typescript
// Loading
<ActivityIndicator size="large" color={colors.primary} />

// Empty state
<Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl }]}>
  No items yet.
</Text>
```

---

## 10. Styling Approach

### Pattern: Static layout + dynamic color
Always split static sizing from dynamic theming:

```typescript
// DO THIS
<View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} />

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 }
});

// NOT THIS — don't inline everything or skip StyleSheet
<View style={{ borderRadius: 12, padding: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' }} />
```

### Minimum touch target
All interactive elements must be at least **44px tall**.

### Safe area
Every screen root must be wrapped in `<SafeAreaView>` with `backgroundColor: colors.background`.

---

## 11. Key Files

| File | Purpose |
|------|---------|
| `constants/theme.ts` | Colors, Typography, Spacing, Radius constants |
| `context/AppContext.tsx` | Global state, accent color preference |
| `app/_layout.tsx` | Root layout, theme provider |
| `app/(tabs)/_layout.tsx` | Tab bar config |
