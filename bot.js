const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ✅ شعار CloveBot في الطرفية
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

const userLinks = {};
const userChoices = {};

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, '👋 مرحبًا! أرسل رابط فيديو من TikTok أو YouTube أو Instagram.');
});

bot.on('message', msg => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/')) return;
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
          { text: '🎵 صوت (mp3)', callback_data: 'type_mp3' }
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

    exec(`./yt-dlp --extract-audio --audio-format mp3 -o "${filePath}" "${url}"`, (error, stdout, stderr) => {
      if (error) {
        bot.sendMessage(chatId, `❌ فشل التحويل:\n${stderr}`);
        return;
      }

      if (!fs.existsSync(filePath)) {
        bot.sendMessage(chatId, `❌ الملف لم يتم إنشاؤه:\n${fileName}`);
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

    exec(`./yt-dlp ${format} --merge-output-format mp4 -o "${filePath}" "${url}"`, (error, stdout, stderr) => {
      if (error) {
        bot.sendMessage(chatId, `❌ فشل التحميل:\n${stderr}`);
        return;
      }

      if (!fs.existsSync(filePath)) {
        bot.sendMessage(chatId, `❌ الملف لم يتم إنشاؤه:\n${fileName}`);
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
      }).catch(err => {
        bot.sendMessage(chatId, `⚠️ تعذر إرسال الفيديو:\n${err.message}`);
      });
    });
  }
});
