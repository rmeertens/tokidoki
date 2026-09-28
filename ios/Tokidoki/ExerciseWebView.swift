import SwiftUI
import WebKit

/// Hosts the bundled Tokidoki exercise pages.
///
/// Pages are served from a custom `tokidoki://app/` origin instead of `file://`
/// so that `localStorage` (SRS progress, stats, settings) has a stable origin
/// and persists across launches.
struct ExerciseWebView: UIViewRepresentable {
    static let scheme = "tokidoki"
    static let startURL = URL(string: "\(scheme)://app/index.html")!

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(BundledWebAssetHandler(), forURLScheme: Self.scheme)
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        #if DEBUG
        webView.isInspectable = true
        #endif

        Self.installOfflineRules(on: config.userContentController) {
            webView.load(URLRequest(url: Self.startURL))
        }
        return webView
    }

    /// Blocks every http(s) subresource (e.g. the Google Analytics tag) so the app never uses the network.
    private static func installOfflineRules(on controller: WKUserContentController, then load: @escaping @MainActor () -> Void) {
        let rules = """
        [{"trigger": {"url-filter": "^https?://"}, "action": {"type": "block"}}]
        """
        WKContentRuleListStore.default().compileContentRuleList(forIdentifier: "tokidoki-offline", encodedContentRuleList: rules) { list, error in
            MainActor.assumeIsolated {
                if let list { controller.add(list) }
                if let error { print("Offline rule list failed to compile: \(error)") }
                load()
            }
        }
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping @MainActor (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            let isUserClick = navigationAction.navigationType == .linkActivated
            let isExternal = url.scheme != ExerciseWebView.scheme
            if isUserClick && isExternal {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            } else {
                decisionHandler(.allow)
            }
        }

        /// `target="_blank"` links (e.g. the practice-sheet PDFs) would otherwise do nothing.
        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if let url = navigationAction.request.url {
                if url.scheme == ExerciseWebView.scheme {
                    webView.load(navigationAction.request)
                } else {
                    UIApplication.shared.open(url)
                }
            }
            return nil
        }
    }
}

/// Serves files from the app bundle's `Web` folder for `tokidoki://app/<path>`.
final class BundledWebAssetHandler: NSObject, WKURLSchemeHandler {
    private let root: URL = Bundle.main.resourceURL!.appendingPathComponent("Web", isDirectory: true)

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let requestURL = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        var path = requestURL.path
        if path.isEmpty || path == "/" { path = "/index.html" }
        let fileURL = root.appendingPathComponent(String(path.dropFirst())).standardizedFileURL

        guard fileURL.path.hasPrefix(root.standardizedFileURL.path),
              let data = try? Data(contentsOf: fileURL) else {
            let response = HTTPURLResponse(url: requestURL, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(Data())
            urlSchemeTask.didFinish()
            return
        }

        let response = HTTPURLResponse(
            url: requestURL,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: [
                "Content-Type": Self.mimeType(for: fileURL.pathExtension),
                "Content-Length": String(data.count),
            ]
        )!
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private static func mimeType(for ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "js", "mjs": return "text/javascript; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "json": return "application/json; charset=utf-8"
        case "pdf": return "application/pdf"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "woff2": return "font/woff2"
        default: return "application/octet-stream"
        }
    }
}
