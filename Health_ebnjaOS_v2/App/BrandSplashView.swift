import SwiftUI

struct BrandSplashView: View {
    @State private var contentOpacity: Double = 0
    @State private var contentScale: CGFloat = 0.96

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 18) {
                Image("LaunchLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 132, height: 132)
                    .shadow(color: Color.blue.opacity(0.22), radius: 18, x: 0, y: 8)

                Text("ebnjaOS Health")
                    .font(.system(size: 24, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.95))
                    .tracking(0.2)
            }
            .opacity(contentOpacity)
            .scaleEffect(contentScale)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.7)) {
                contentOpacity = 1
                contentScale = 1
            }
        }
    }
}
