# Welcome to your Expo app 👋

## Shared design system

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for tokens, Inter typography,
component contracts, and usage rules. Import shared primitives from
`@/components/ui`. Open **View design system** from the development home screen
to inspect the catalogue and try component states.

## NativeWind v5

Styling uses NativeWind `5.0.0-rc.0`, `react-native-css` `3.1.0-rc.0`, and
Tailwind CSS `4.1.12`, following the [v5 installation guide](https://www.nativewind.dev/v5/getting-started/installation).

From the repository root, install with `pnpm install` and start with `pnpm mobile`.
After changing Metro or PostCSS configuration, use `pnpm --filter mobile start --clear`.

Use `className` on React Native components. Global styles and Tailwind theme
customization belong in `global.css`, which is imported once by `src/app/_layout.tsx`.
Metro integration is in `metro.config.js`; Tailwind runs through `postcss.config.mjs`.
The workspace pins Lightning CSS to `1.30.1` in `pnpm-workspace.yaml`.

Verify with `pnpm --filter mobile exec tsc --noEmit`, `pnpm --filter mobile lint`,
and `pnpm --filter mobile exec expo install --check`.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Expo SDK and Expo Go

This app targets Expo SDK 58 (Expo 58.0.19, React Native 0.88, React 19.3).
Use an SDK 58 compatible Expo Go build. Node.js 24.3+ on the 24 line is supported.
After upgrading, restart Metro with `pnpm --filter mobile start --clear`.

The pnpm patch in `patches/react-native-css@3.1.0-rc.0.patch` forwards React
Native 0.88's `AssetRegistry` through NativeWind's component wrapper. Without it,
Expo font loading crashes with `getAssetByID` on Android/iOS. Keep the patch until
the installed react-native-css version forwards this export itself. Verify with
`node --test apps/mobile/scripts/asset-registry.test.cjs` from the repository root.

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm mobile
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
