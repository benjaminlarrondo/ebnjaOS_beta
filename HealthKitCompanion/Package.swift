// swift-tools-version: 5.10

import PackageDescription

let package = Package(
    name: "HealthKitCompanion",
    defaultLocalization: "en",
    platforms: [
        .iOS(.v17),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "HealthKitCompanion",
            targets: ["HealthKitCompanion"]
        )
    ],
    targets: [
        .target(
            name: "HealthKitCompanion",
            path: "Sources/HealthKitCompanion"
        )
    ]
)
