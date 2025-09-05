#!/bin/bash

# ✅ تحميل yt-dlp (نسخة Linux الأصلية)
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o yt-dlp
chmod +x yt-dlp

# ✅ تحميل ffmpeg بصيغة tar.xz
mkdir -p ffmpeg
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz -o ffmpeg.tar.xz
tar -xf ffmpeg.tar.xz --strip-components=1 -C ffmpeg
rm ffmpeg.tar.xz

# ✅ تشغيل البوت
node bot.js
