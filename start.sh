#!/bin/bash

# ✅ تحميل yt-dlp (نسخة Linux لا تعتمد على Python)
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o yt-dlp
chmod +x yt-dlp

# ✅ تحميل ffmpeg (نسخة static بصيغة tar.xz)
mkdir -p ffmpeg
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz
tar -xf ffmpeg.tar.xz --strip-components=1 -C ffmpeg
rm ffmpeg.tar.xz

# ✅ تشغيل البوت
node bot.js
