# Canonical Build

Repository: `/Users/benjaminlarrondo/Documents/ebnjaOS_beta`
Branch: `feature/phase3-healthkit-companion`
Commit: `cad542ad5a15a23d0079653417efae1c3f4e0f26`
Project/workspace: `Health_ebnjaOS_v2/Health_ebnjaOS_v2.xcodeproj`
Target: `Health_ebnjaOS_v2`
Scheme: `Health_ebnjaOS_v2`
Configuration: `Debug`
Destination: `platform=iOS Simulator,name=iPhone 17 Pro Max`
Bundle identifier: `com.ebnjaos.health`
App name: `ebnjaOS`
Entry point: `Health_ebnjaOS_v2/App/Health_ebnjaOSApp.swift`
Root view: `RootView()`

## Build command
```bash
set -o pipefail
xcodebuild \
  -project Health_ebnjaOS_v2/Health_ebnjaOS_v2.xcodeproj \
  -scheme Health_ebnjaOS_v2 \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max' \
  clean build | tee /tmp/ebnjaos_canonical_audit_build.log
```

## Clean installation procedure
1. Delete DerivedData for this project.
2. Build the `Health_ebnjaOS_v2` scheme in `Debug`.
3. Install the resulting `ebnjaOS.app` on the selected simulator or on device.
4. If testing on device, use the same bundle identifier `com.ebnjaos.health`.
5. Launch from Xcode or `simctl` after a fresh install.

## Verification route
1. Confirm `@main` is `Health_ebnjaOS_v2App`.
2. Confirm `RootView()` instantiates the `TabView`.
3. Confirm the tabs are Home, Fitness, Agenda, Brain, and Más.
4. Confirm `MoreView` contains the technical HealthKit / EventKit / Sync hub.
5. Confirm HealthKit on simulator is mock-only and device path requests real permissions.
6. Confirm Tete/Agenda read from the `celeste_calendar` snapshot adapter.

## Expected visible result
- App name: `ebnjaOS`
- Icon: `AppIcon` from `Assets.xcassets`
- Entry point: `Health_ebnjaOS_v2App`
- Root UI: `RootView`
- Main navigation: five-tab SwiftUI shell
- Fitness: routines and training execution UI
- Agenda: 5-day calendar-lite with Tete integration
- More: technical permissions, sync, and diagnostics
