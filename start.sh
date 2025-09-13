#!/bin/bash

echo "🚀 بدء تشغيل CloveBot..."

# ✅ تحميل yt-dlp (نسخة Linux لا تعتمد على Python)
if [ ! -f yt-dlp ]; then
  echo "📦 تحميل yt-dlp..."
  curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o yt-dlp
  chmod +x yt-dlp
else
  echo "✅ yt-dlp موجود مسبقًا."
fi

# ✅ تحميل ffmpeg (نسخة static بصيغة tar.xz)
if [ ! -d ffmpeg ]; then
  echo "📦 تحميل ffmpeg..."
  mkdir -p ffmpeg
  curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz
  tar -xf ffmpeg.tar.xz --strip-components=1 -C ffmpeg
  rm ffmpeg.tar.xz
else
  echo "✅ ffmpeg موجود مسبقًا."
fi

# ✅ تثبيت dotenv لو ناقصة
if ! npm list dotenv >/dev/null 2>&1; then
  echo "📦 تثبيت dotenv..."
  npm install dotenv
fi

# ✅ تشغيل البوت
echo "🧠 تشغيل البوت..."
node bot.js
