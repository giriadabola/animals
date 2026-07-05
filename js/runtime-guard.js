(function () {
    if (window.location.protocol !== "file:") return;

    function showFileProtocolWarning() {
        if (document.getElementById("file-protocol-warning")) return;

        const overlay = document.createElement("div");
        overlay.id = "file-protocol-warning";
        overlay.setAttribute("role", "alert");
        overlay.style.cssText = [
            "position:fixed",
            "inset:0",
            "z-index:99999",
            "display:flex",
            "align-items:center",
            "justify-content:center",
            "padding:24px",
            "background:rgba(5, 10, 8, 0.96)",
            "backdrop-filter:blur(8px)",
            "font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "color:#f3f4f6"
        ].join(";");

        overlay.innerHTML = `
            <div style="max-width:760px; width:100%; background:linear-gradient(180deg, rgba(17, 24, 39, 0.98), rgba(10, 15, 12, 0.98)); border:1px solid rgba(255,255,255,0.12); border-radius:22px; padding:28px; box-shadow:0 30px 80px rgba(0,0,0,0.45);">
                <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
                    <div style="width:46px; height:46px; border-radius:14px; display:grid; place-items:center; background:linear-gradient(135deg, #10b981, #f59e0b); color:#04110b; font-size:1.4rem; font-weight:800;">!</div>
                    <div>
                        <h1 style="margin:0; font-size:1.45rem; line-height:1.2;">Esta app não deve ser aberta por ficheiro local</h1>
                        <p style="margin:6px 0 0; color:#cbd5e1; line-height:1.5;">Se abrires o HTML por <strong>file://</strong>, os scripts modulares e o service worker podem falhar e a página fica presa em loading.</p>
                    </div>
                </div>
                <div style="padding:16px 18px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
                    <p style="margin:0 0 10px; color:#e5e7eb; font-weight:700;">Abre o projeto num servidor local, por exemplo:</p>
                    <p style="margin:0; color:#cbd5e1; line-height:1.7;">
                        1. Usa o <strong>Live Server</strong> no VS Code<br>
                        2. Ou serve esta pasta em <strong>http://127.0.0.1:5500</strong><br>
                        3. Depois entra por <strong>index.html</strong>
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const loadingMessage = document.getElementById("loading-message");
        if (loadingMessage) {
            loadingMessage.textContent = "A app foi aberta por file://. Usa um servidor local para carregar corretamente.";
            loadingMessage.style.color = "#fbbf24";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", showFileProtocolWarning, { once: true });
    } else {
        showFileProtocolWarning();
    }
})();
