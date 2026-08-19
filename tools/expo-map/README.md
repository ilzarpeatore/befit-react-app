# expo-map

Generates a visual navigation map of this app's screens: `.expo-map/map.html`,
an interactive graph of every registered screen and the `navigate()` calls
between them.

Built on [aleqsio/expo-map](https://github.com/aleqsio/expo-map) (MIT,
vendored in `vendor/`). That tool expects expo-router (`app/` directory) or a
`src/routes.ts` + `src/Navigation.tsx` pair (the react-navigation convention
it supports, as used in Bluesky). This app registers its ~130 screens
directly in `App.tsx` via `React.lazy()` + `<Screen name=... component={...}/>`,
so `generate-manifest.mjs` derives an equivalent manifest from `App.tsx` on
the fly; `generate-map.sh` runs the parser and renderer against it and
deletes the manifest again immediately after.

## Usage

```bash
./tools/expo-map/generate-map.sh
open .expo-map/map.html
```

Re-run it any time `App.tsx`'s screen registrations change. Output is
gitignored — it's a local dev artifact, not a build product.

## Limitations

- **Static only.** No iOS/Android simulator is available in this container,
  so there are no screenshots and no runtime-state capture (bottom sheets,
  modals). The map shows the route graph and navigation edges only.
- **Leaf screens only.** Nested navigator containers defined inline in
  `App.tsx` (e.g. `Homenavigator`, `MigratedNavigator`) aren't real screens
  and are skipped; their children are already registered individually.
- To get screenshots and runtime states, run the full expo-map skill
  (`git clone https://github.com/aleqsio/expo-map`, symlink
  `skills/expo-map` into `~/.claude/skills/`, then `/expo-map`) on a machine
  with an iOS simulator — Phases 3-5 in that tool's `SKILL.md` need one.
