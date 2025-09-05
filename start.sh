#!/bin/bash

# تحميل ffmpeg
mkdir -p ffmpeg
curl -L https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip -o ffmpeg.zip
unzip ffmpeg.zip -d ffmpeg
mv ffmpeg/ffmpeg-*/* ffmpeg/
rm -rf ffmpeg.zip

# تشغيل البوت
node bot.js
