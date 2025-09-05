#!/bin/bash

# تحميل yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
chmod +x yt-dlp

# تحميل ffmpeg
mkdir -p ffmpeg
curl -L https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip -o ffmpeg.zip
unzip ffmpeg.zip -d ffmpeg
mv ffmpeg/ffmpeg-*/* ffmpeg
rm -rf ffmpeg/ffmpeg-*
rm ffmpeg.zip

# تشغيل البوت
node bot.js
