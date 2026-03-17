# GymCom — Claude Instructions

## Styling

When working on any UI, components, screens, or styling changes, **always reference the style guide first**:

📄 `.claude/documentation/style-guide.md`

Key rules:
- Use `useColors()` hook for all colors — never hardcode hex values
- Use `Spacing`, `Radius`, and `Typography` constants from `constants/theme.ts`
- Split static layout into `StyleSheet.create()` and apply dynamic colors inline
- Wrap every screen in `<SafeAreaView style={{ backgroundColor: colors.background }}>`
- Icons: `@expo/vector-icons` Ionicons only, `-outline` variants preferred
- Minimum touch target height: 44px
