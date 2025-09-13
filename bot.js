const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
    CCCCCCCCCCCCC      LLLLLLLLLLL             OOOOOOOOO      VVVVVVVV             VVVVVVVV EEEEEEEEEEEEEEEEEEEEEE
 CCC::::::::::::C      L:::::::::L           OO:::::::::OO    V::::::V             V::::::V E::::::::::::::::::::E
CC:::::::::::::::C     L:::::::::L         OO:::::::::::::OO  V::::::V            V::::::V  E::::::::::::::::::::E
C:::::CCCCCCCC::::C    LL:::::::LL        O:::::::OOO:::::::O  V::::::V           V::::::V  EE::::::EEEEEEEEE::::E
C:::::C       CCCCC      L:::::L         O:::::::O   O:::::::O  V:::::V           V:::::V    E:::::E       EEEEEE
C:::::C                  L:::::L         O::::::O     O::::::O   V:::::V         V:::::V     E:::::E             
C:::::C                  L:::::L         O::::::O     O::::::O    V:::::V       V:::::V      E::::::EEEEEEEEEE   
C:::::C                  L:::::L         O::::::O     O::::::O     V:::::V     V:::::V       E:::::::::::::::E   
C:::::C                  L:::::L         O::::::O     O::::::O      V:::::V   V:::::V        E:::::::::::::::E   
C:::::C                  L:::::L         O::::::O     O::::::O       V:::::V V:::::V         E::::::EEEEEEEEEE   
C:::::C                  L:::::L         O::::::O     O::::::O        V:::::V:::::V          E:::::E             
C:::::C       CCCCCC     L:::::L         O:::::::O   O:::::::O         V:::::::::V           E:::::E       EEEEEE
C:::::CCCCCCCC:::::C   LL:::::::LL       O::::::::OOO:::::::O           V:::::::V           EE::::::EEEEEEEE:::::E
CC::::::::::::::::C    L:::::::::L        OO:::::::::::::OO              V:::::V            E::::::::::::::::::::E
 CCC:::::::::::::C     L:::::::::L          OO:::::::::OO                 V:::V             E::::::::::::::::::::E
   CCCCCCCCCCCCCC      LLLLLLLLLLL             OOOOOOOOO                   VVV              EEEEEEEEEEEEEEEEEEEEEE
   
=====  CloveBot  =====
=====Made  in  SA=====
`);

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const ffmpegPath = path.join(__dirname, 'ffmpeg', 'ffmpeg');
const userLinks = {};
const userChoices = {};

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
function isImageUrl(url) {
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, '👋 مرحبًا! أرسل رابط فيديو أو صورة أو أغنية من TikTok أو YouTube أو Spotify أو أي رابط مباشر لصورة.');
});

bot.on('message', msg => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || typeof text !== 'string') return;
  if (text.startsWith('/')) return;

  // ✅ تنبيه خاص لروابط TikTok من نوع photo
  if (text.includes('tiktok.com') && text.includes('/photo/')) {
    bot.sendMessage(chatId, '📷 روابط الصور من TikTok غير مدعومة حاليًا.\nافتح الرابط في المتصفح وانسخ رابط الصورة المباشر.');
    return;
  }

  // ✅ تحميل صورة مباشرة
  if (isImageUrl(text)) {
    const fileName = `image_${Date.now()}${path.extname(text)}`;
    const filePath = path.join(__dirname, fileName);

    exec(`curl -L "${text}" -o "${filePath}"`, (error, stdout, stderr) => {
      if (error || !fs.existsSync(filePath)) {
        bot.sendMessage(chatId, `❌ فشل تحميل الصورة:\n${stderr || error.message}`);
        return;
      }

      bot.sendPhoto(chatId, filePath).then(() => {
        fs.unlinkSync(filePath);
      }).catch(err => {
        bot.sendMessage(chatId, `⚠️ تعذر إرسال الصورة:\n${err.message}`);
      });
    });

    return;
  }

  // ✅ تحميل أغنية من رابط Spotify عبر البحث في YouTube
  if (text.includes('spotify.com/track/')) {
    bot.sendMessage(chatId, '🎧 جاري البحث عن الأغنية على YouTube...');

    const query = `"${text}" audio`;
    const fileName = `spotify_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, fileName);

    exec(`./yt-dlp "ytsearch1:${query}" --extract-audio --audio-format mp3 -o "${filePath}"`, (error, stdout, stderr) => {
      if (error || !fs.existsSync(filePath)) {
        bot.sendMessage(chatId, `❌ فشل تحميل الأغنية:\n${stderr || error.message}`);
        return;
      }

      bot.sendAudio(chatId, filePath).then(() => {
        fs.unlinkSync(filePath);
      }).catch(err => {
        bot.sendMessage(chatId, `⚠️ تعذر إرسال الملف:\n${err.message}`);
      });
    });

    return;
  }

  // ✅ روابط فيديوهات وصوت وصورة مصغرة
  if (!text.startsWith('http')) {
    bot.sendMessage(chatId, '📨 تم استلام رسالتك: ' + text);
    return;
  }

  userLinks[chatId] = text;
  userChoices[chatId] = {};

  bot.sendMessage(chatId, '🎛️ اختر نوع الملف الذي تريده:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📹 فيديو (mp4)', callback_data: 'type_mp4' },
          { text: '🎵 صوت (mp3)', callback_data: 'type_mp3' },
          { text: '🖼️ صورة (thumbnail)', callback_data: 'type_image' }
        ]
      ]
    }
  });
});

bot.on('callback_query', query => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const url = userLinks[chatId];

  if (!url) {
    bot.sendMessage(chatId, '❌ لم يتم العثور على رابط.');
    return;
  }

  if (data === 'type_image') {
    bot.sendMessage(chatId, '📷 جاري استخراج الصورة المصغرة...');

    const fileName = `thumb_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, fileName);

    exec(`./yt-dlp --write-thumbnail --skip-download --convert-thumbnails jpg --ffmpeg-location "${ffmpegPath}" -o "${filePath}" "${url}"`, (error, stdout, stderr) => {
      if (error || !fs.existsSync(filePath)) {
        bot.sendMessage(chatId, `❌ فشل استخراج الصورة:\n${stderr || error.message}`);
        return;
      }

      bot.sendPhoto(chatId, filePath).then(() => {
        fs.unlinkSync(filePath);
        delete userLinks[chatId];
        delete userChoices[chatId];
      }).catch(err => {
        bot.sendMessage(chatId, `⚠️ تعذر إرسال الصورة:\n${err.message}`);
      });
    });

    return;
  }

  if (data === 'type_mp4') {
    userChoices[chatId].type = 'mp4';
    bot.sendMessage(chatId, '🎚️ اختر جودة الفيديو:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔽 منخفضة', callback_data: 'quality_low' },
            { text: '⚖️ متوسطة', callback_data: 'quality_medium' },
            { text: '🔼 عالية', callback_data: 'quality_high' }
          ]
        ]
      }
    });
    return;
  }

  if (data === 'type_mp3') {
    userChoices[chatId].type = 'mp3';
    bot.sendMessage(chatId, '📥 جاري استخراج الصوت...');

    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, fileName);

    exec(`./yt-dlp --ffmpeg-location "${ffmpegPath}" --extract-audio --audio-format mp3 -o "${filePath}" "${url}"`, (error, stdout, stderr) => {
      if (error || !fs.existsSync(filePath)) {
        bot.sendMessage(chatId, `❌ فشل التحويل:\n${stderr || error.message}`);
        return;
      }

      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        bot.sendMessage(chatId, `⚠️ الملف تم إنشاؤه لكنه فارغ.`);
        fs.unlinkSync(filePath);
        return;
      }

      bot.sendDocument(chatId, filePath).then(() => {
        fs.unlinkSync(filePath);
        delete userLinks[chatId];
        delete userChoices[chatId];
      }).catch(err => {
        bot.sendMessage(chatId, `⚠️ تعذر إرسال الملف:\n${err.message}`);
      });
    });

    return;
  }

  if (data.startsWith('quality_')) {
    const quality = data.split('_')[1];
    let format = '';
    if (quality === 'low') format = '-f "bv*[height<=360]+ba/b[height<=360]"';
    if (quality === 'medium') format = '-f "bv*[height<=720]+ba/b[height<=720]"';
    if (quality === 'high') format = '-f "bestvideo+bestaudio/best"';

    bot.sendMessage(chatId, `📥 جاري تحميل الفيديو بجودة ${quality}...`);

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, fileName);

    exec(`./yt-dlp ${format} --ffmpeg-location "${ffmpegPath}" --merge-output-format mp4 -o "${filePath}" "${url}"`, (error, stdout, stderr) => {
      if (error || !fs.existsSync(filePath)) {
        bot.sendMessage(chatId, `❌ فشل التحميل:\n${stderr || error.message}`);
        return;
      }

      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        bot.sendMessage(chatId, `⚠️ الملف تم إنشاؤه لكنه فارغ.`);
        fs.unlinkSync(filePath);
        return;
      }

      const fileSizeMB = stats.size / (1024 * 1024);
      const sendMethod = fileSizeMB > 48 ? bot.sendDocument : bot.sendVideo;

      sendMethod.call(bot, chatId, filePath).then(() => {
        fs.unlinkSync(filePath);
        delete userLinks[chatId];
        delete userChoices[chatId];
      }).
