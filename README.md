# 🎬 SoniqViz 4K Cloud Video Renderer (GitHub Actions)

Rendering video visualizer beresolusi **4K / 1080p 60 FPS** kini bisa dilakukan 100% di cloud secara gratis menggunakan **GitHub Actions Serverless Compute** (~2,000 menit rendering gratis per bulan).

---

## 🚀 Cara Menggunakan:

### Opsi 1: Otomatis via SoniqViz Web App
1. Buat repository baru di GitHub (bisa Public atau Private).
2. Upload file template ini ke repository Anda.
3. Buat **GitHub Personal Access Token (Classic / Fine-grained)** dengan izin `repo` & `workflow`.
4. Buka menu **Export Video > Tab "🐙 GitHub Cloud Render"** di aplikasi SoniqViz.
5. Klik **"Mulai Render Online di GitHub Actions"**.
6. Video MP4 beresolusi tinggi akan dirender di server GitHub dan bisa langsung diunduh otomatis setelah selesai!

### Opsi 2: Manual via GitHub Web UI
1. Masuk ke repository GitHub Anda.
2. Buka tab **Actions** > Pilih **"SoniqViz 4K/1080p Cloud Visualizer Video Renderer"**.
3. Klik **Run workflow**.
4. Masukkan judul lagu, artis, resolusi (4K / 1080p), rasio (16:9 / 9:16 / 1:1), dan framerate (60 FPS).
5. Setelah status *green checkmark*, buka run tersebut dan unduh berkas MP4 dari bagian **Artifacts**.
