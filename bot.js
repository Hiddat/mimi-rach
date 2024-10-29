// const { handleInteraction, handleModalSubmit } = require('./cmds/Moderation/autoembed');
const { prefix: defaultPrefix } = require('./config.json');
const fs = require('fs')
const path = require('path')

function updateMotelStatus() {
    const motelsPath = path.join(__dirname, 'motels.json');
    const motels = JSON.parse(fs.readFileSync(motelsPath));
    
    motels.forEach(motel => {
      const randomStatus = Math.random();
      if (randomStatus < 0.1) {
        motel.status = 'closed';
      } else if (randomStatus < 0.3) {
        motel.status = 'busy';
      } else if (randomStatus < 0.5) {
        motel.status = 'full';
      } else {
        motel.status = 'open';
      }
    });
  
    fs.writeFileSync(motelsPath, JSON.stringify(motels, null, 2));
}
  
  setInterval(updateMotelStatus, 600000); // Cập nhật trạng thái mỗi 10 phút
  
  // Khởi tạo trạng thái ban đầu khi bot chạy
  updateMotelStatus();
const { exec } = require('child_process');


const fetch = require('node-fetch');
const SpotifyWebApi = require('spotify-web-api-node');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require('./config.json');

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require('discord.js');
const { Client, GatewayIntentBits, Partials, Collection, ChannelType, PermissionsBitField, VoiceConnectionStatus , InteractionType } = require('discord.js')
const axios = require('axios')
const dictionary = require('./utils/dictionary')
const { setChannel } = require('./utils/channel')
const stats = require('./utils/stats')
require('dotenv').config()
const synchronizeSlashCommands = require('./modules/sync_commands.js')
const { ActivityType } = require('discord.js')
const emptyData = {}
const dataPath = path.resolve(__dirname, './data/data.json')
const wordDataPath = path.resolve(__dirname, './data/word-data.json')
const queryPath = path.resolve(__dirname, './data/query.txt')
const wordPlayedPath = path.resolve(__dirname, './data/word-played.txt')
const roundPlayedPath = path.resolve(__dirname, './data/round-played.txt')
const wordDataUrl = 'https://edit.thanhxuan.xyz/words.txt'
const wordDatabasePath = path.resolve(__dirname, './data/words.txt')
const rankingPath = path.resolve(__dirname, './data/ranking.json')
const premiumGuildsPath = path.resolve(__dirname, './data/premium-guilds.txt')
const reportWordsPath = path.resolve(__dirname, './data/report-words.txt')
const officalWordsPath = path.resolve(__dirname, './data/official-words.txt')
const dataBetaDev = require('./db/databaseBetaDev');
const dataBetaDevs = require('./db/dev.js');
const dbconfigcommands = require('./db/configcommands');
const dataAutoReactions = require('./db/databaseAutoReactions');
const chokidar = require('chokidar');
const sodium = require('libsodium-wrappers');
const dbAntiSpam = require('./db/antispam');
const mathjs = require('mathjs'); 
const dbLove = require('./db/databaseLove');
const schedule = require('node-schedule');
const wordsE = fs.readFileSync(path.resolve(__dirname, './data/wordsE.txt'), 'utf-8').split('\n').map(word => word.trim().toLowerCase());
const numberEmojis = [
    '<:0_:1257549818553827348>',
    '<:1_:1257549823767216178>',
    '<:2_:1257549815773003859>',
    '<:3_:1257549813730250913>',
    '<:4_:1257549811524308992>',
    '<:5_:1257549809091608586>',
    '<:6_:1257549806717370379>',
    '<:7_:1257549804582473828>',
    '<:8_:1257549802468802691>',
    '<:9_:1257549800069533818>',
];
const { getWelcomeSettings } = require('./db/welcomesettings.js');
const { getLeaveSettings } = require('./db/leavesettings.js');
const { removeAFK, getAFK, getAFKMentions, removeAFKMentions  } = require('./db/database');
if (!fs.existsSync(dataPath)) {fs.writeFileSync(dataPath, JSON.stringify(emptyData))} else {}
if (!fs.existsSync(wordDataPath)) {fs.writeFileSync(wordDataPath, JSON.stringify(emptyData))} else {}
if (!fs.existsSync(queryPath)) {fs.writeFileSync(queryPath, '0')} else {}
if (!fs.existsSync(rankingPath)) {fs.writeFileSync(rankingPath, JSON.stringify(emptyData))} else {}
if (!fs.existsSync(premiumGuildsPath)) {fs.writeFileSync(premiumGuildsPath, '')} else {}
if (!fs.existsSync(reportWordsPath)) {fs.writeFileSync(reportWordsPath, '')} else {}
if (!fs.existsSync(officalWordsPath)) {fs.writeFileSync(officalWordsPath, '')} else {}
if (!fs.existsSync(wordPlayedPath)) {fs.writeFileSync(wordPlayedPath, '0')} else {}
if (!fs.existsSync(roundPlayedPath)) {fs.writeFileSync(roundPlayedPath, '0')} else {}
const client = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,        // Lấy nội dung tin nhắn
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.GuildMember, 
        Partials.User, 
        Partials.GuildScheduledEvent
    ]
})
// load word data
if (!fs.existsSync(wordDatabasePath)) {
    axios.get(wordDataUrl)
        .then(async res => {
            const lines = res.data.trim().split('\n')
            const wordsdb = lines.map(line => JSON.parse(line).text)
            fs.writeFileSync(wordDatabasePath, wordsdb.join('\n'))

            await continueExecution()
        })
        .catch(err => {
            return
        })
} else {
    continueExecution()
}
let debounceTimeout = null;
async function continueExecution() {
    fs.readFile(wordDatabasePath, 'utf-8', (err, data) => {
        if (err) {
            return;
        }
        const tempWord = data.toLowerCase().split('\n');
        global.dicData = tempWord.filter(w => w.split(' ').length == 2 && !w.includes('-') && !w.includes('(') && !w.includes(')'));
    });
}

// Debouncing function
function debounce(func, wait) {
    return function(...args) {
        // Clear existing timeout if any
        if (debounceTimeout) clearTimeout(debounceTimeout);
        
        // Set a new timeout
        debounceTimeout = setTimeout(() => {
            func.apply(this, args);
            debounceTimeout = null; // Reset timeout after execution
        }, wait);
    };
}

// Watch for file changes and use debounced reload
fs.watch(wordDatabasePath, (eventType, filename) => {
    if (eventType === 'change') {
        debounce(continueExecution, 300000)(); // 5 minutes
    }
});
// global config
const START_COMMAND = '?start'
const STOP_COMMAND = `?stop`
const PREFIX_SET = '?mimi'
let queryCount = stats.getQuery()
client.commands = new Collection()
client.commands2 = new Collection();
const checkAvatarCommand = require('./cmds/Info/avatar');
client.commands2.set(checkAvatarCommand.name, checkAvatarCommand);
// const logChatCommand = require('./cmds/Moderation/logChat');
// const logVoiceCommand = require('./cmds/Moderation/logVoice');
// client.commands2.set(logChatCommand.name, logChatCommand);
// client.commands2.set(logVoiceCommand.name, logVoiceCommand);
const cooldowns = new Collection();
// client.cooldowns = new Collection();
client.aliases = new Collection();
const afkUsers = new Map(); // Bộ sưu tập để lưu trữ trạng thái AFK của người dùng

const prefixes = JSON.parse(fs.readFileSync('./data/prefixes.json', 'utf8')); // Đọc file prefixes.json

// Lưu lại prefix mới vào file JSON
function savePrefixes() {
    fs.writeFileSync('prefixes.json', JSON.stringify(prefixes, null, 2));
}

client.on('guildCreate', async guild => {
    let channel = guild.channels.cache.find(channel => channel.type === 0 && channel.permissionsFor(guild.members.me).has('SendMessages'));
    
    if (channel) {
        let content = `Xin chào mọi người, và các staff server đã ủng hộ và mời bot vào server!`
        const embed = new EmbedBuilder()
            // .setTitle('Mimi Bot')
            .setDescription(`<a:pinkfire:1256798201055285370> Xin chào mọi người, mình là **Mimi Bot** <a:pinkfire:1256798201055285370>\n
                <a:mmb_arrow:1255341510954713138>1 bot nối từ Tiếng Anh, Tiếng Việt, Nối số, Nối số la mã
                <a:mmb_arrow:1255341510954713138>Và 1 số lệnh khác và có cả Giveaway bao gồm:
                <a:1900tick:1255341646271221837> **Giveaway**, **rerollgiveaway**, **endgiveaway**
                \n<a:NQG_xc126:1255341397981266012> Tất cả chức năng của bot <@1207923287519268875> **hoàn toàn free không nhắm tới mục đích premium**!<a:NQG_xc126:1255341397981266012>
                <a:mmb_arrow:1255341510954713138> Chọn vào **menu bên dưới** để xem hướng dẫn sử dụng 1 số lệnh (trong 24 giờ)
                <a:THUTINH:1255341478855573597> Đại diện bot <@1145030539074600970> cảm ơn mn đã tin và sử dụng bot<:mimi:1258599282311827496> <a:THUTINH:1255341478855573597>`)
            .setColor('#F5B7B1')
            .setImage('https://cdn.discordapp.com/attachments/1256309505340215416/1268159605280604181/8edd25eaef846269172c3c8ed5cb1e08.gif?ex=66ab692b&is=66aa17ab&hm=58a85c4f99f6470eefafea6bdf59e0fa17bc400c4c46641e36811b3dc63e56d6&')
            // .setThumbnail('https://images-ext-1.discordapp.net/external/Pfa0JBfQqS8S5eicYVvdWHLsn4VI9MYVKULtvaZbI3g/%3Fsize%3D512/https/cdn.discordapp.com/avatars/1207923287519268875/a310021e37834b040d7f8eb1eb7f0f5b.webp?format=webp&width=640&height=640') // Thay thế bằng đường dẫn thực của ảnh
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/mimibot')
                    .setEmoji('<:mimi:1258599282311827496>'),
                new ButtonBuilder()
                    .setLabel('Invite Me')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1207923287519268875&permissions=0&integration_type=0&scope=bot')
                    .setEmoji('<a:THUTINH:1255341478855573597>'),
                new ButtonBuilder()
                    .setLabel('Vote Me !')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://top.gg/bot/1207923287519268875/vote')
                    .setEmoji('<a:2006pinkflame:1261960949951365212>')
            );

        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Click vô đây để được xem hướng dẫn')
                    .addOptions([
                        {
                            label: 'Hướng dẫn nối từ Tiếng Việt',
                            value: 'vietnam',
                        },
                        {
                            label: 'Hướng dẫn nối chữ Tiếng Anh',
                            value: 'english',
                        },
                        {
                            label: 'Hướng dẫn nối số bình thường',
                            value: 'so',
                        },
                        {
                            label: 'Hướng dẫn nối số la mã',
                            value: 'solama',
                        },
                        {
                            label: 'Hướng dẫn tắt bật lệnh ở kênh',
                            value: 'disablecommand',
                        },
                        {
                            label: 'Cú pháp Giveaway gốc',
                            value: 'giveaway',
                        },
                    ])
            );
            

        const message = await channel.send({ content, embeds: [embed], components: [selectMenu, row] });

        // Create a message collector to handle interactions
        const filter = (interaction) => interaction.isSelectMenu() && interaction.customId === 'select';
        
        // Set the collector to 24 hours (86400000 milliseconds)
        const collector = message.createMessageComponentCollector({ filter, time: 86400000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'select') {
                let description = '';
                let title = '';
                switch (interaction.values[0]) {
                    case 'vietnam':
                        title='set kênh nối từ tiếng Việt'
                        description = `<a:mmb_arrow:1255341510954713138> setnoichu : set kênh nối từ việt cho server.
                            Ví dụ: setnoichu <#kênh >\n
                            <a:mmb_arrow:1255341510954713138> ?start : sử dụng lệnh này ở kênh đã set phía trên để bắt đầu game mới\n
                            <a:mmb_arrow:1255341510954713138> ?stop : Sử dụng lệnh này ở kênh đã set phía trên để dừng game và bắt đầu 2 từ mới\n
                            <a:mmb_arrow:1255341510954713138> wordchain : sử dụng để tìm kiếm từ cần nối tiếp theo.
                            Ví dụ: 2 từ đúng gần nhất là: chúng mình .
                            Thì sử dụng lệnh: wordchain mình`;
                        break;
                    case 'english':
                        title='set kênh nối chữ tiếng Anh'
                        description = `<a:mmb_arrow:1255341510954713138> setwordchain: set kênh nối chữ tiếng anh cho server.
                            Ví dụ: setwordchain  #kênh cần set\n
                            <a:mmb_arrow:1255341510954713138> bugworden: set tắt bật trạng thái sai từ mất chuỗi tiếng anh cho server.`;
                        break;
                    case 'so':
                        title='set kênh nối số'
                        description = '<a:mmb_arrow:1255341510954713138> setcountchannel  : set kênh nối số cho server.\nVí dụ: setcountchannel  #kênh cần set';
                        break;
                    case 'solama':
                        title='set kênh nối số la mã'
                        description = '<a:mmb_arrow:1255341510954713138> setromancountch : set kênh nối số la mã cho server.\nVí dụ: setromancountchannel #kênh cần set';
                        break;
                    case 'disablecommand':
                        title='tắt bật lệnh ở trong channel gọi lệnh!'
                        description = '';
                        break;
                    case 'giveaway':
                        title='cú pháp gốc của giveaway'
                        description = `Cú pháp: \`ga 1h 4 10m OwO\`\n
                            Trong đó: 
                            +) \`1h\`: là thời gian kết thúc **Giveaway**. d là ngày, h là giờ, m là phút, s là giây. Max không giới hạn ngày.
                            +) \`4\`: là số lượng người winner trong **Giveaway** này. có thể đặt từ 1 đến vô hạn.
                            +) \`10m OwO\`: là phần thưởng của **Giveaway** này. Bạn có thể đặt tuỳ ý theo ý thích của bản thân!`;
                        break;
                }

                const responseEmbed = new EmbedBuilder()
                    .setTitle('Hướng dẫn')
                    .setDescription(description)
                    .setColor('#F5B7B1')
                    .setTimestamp();

                await interaction.reply({ embeds: [responseEmbed], ephemeral: true });
            }
        });

        collector.on('end', collected => {
            message.edit({ components: [] });
            console.log(`Collected ${collected.size} interactions.`);
        });
    }

    const webhookUrl = 'https://discord.com/api/webhooks/1254802426134003743/ivIE3AKEWcCAjWdH3myXMY1Ab2ZGTisU9S2oJoVMjFZ6DzfxZpxg4VtTmr2boYVAUOMh';

    const embed = new EmbedBuilder()
        .setTitle('Bot Joined a New Server')
        .setDescription(`Joined **${guild.name}**`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp()
        .setAuthor({ name: client.user.tag, iconURL: client.user.displayAvatarURL() })
        // .setImage('https://thanhxuan.xyz/cuoi.jpg')
        .addFields(
            { name: 'Server ID', value: guild.id, inline: false },
            { name: 'Member Count', value: `${guild.memberCount}`, inline: false }
        );

    axios.post(webhookUrl, {
        embeds: [embed.toJSON()]
    }).then(response => {
        console.log('Webhook sent successfully:', response.data);
    }).catch(error => {
        console.error('Error sending webhook:', error);
    });
});

client.on('guildMemberAdd', async (member) => {
    const settings = await getWelcomeSettings(member.guild.id);

    if (!settings || !settings.enabled) return;

    const placeholders = {
        '{userName}': member.user.username,
        '{userID}': member.user.id,
        '{userTag}': `<@${member.user.id}>`,
        '{stt}': member.guild.memberCount,
        '{sttF}': member.guild.members.cache.filter(m => !m.user.bot).size
    };

    const title = replacePlaceholders(settings.title || '', placeholders);
    const description = replacePlaceholders(settings.description || '', placeholders);
    const content = replacePlaceholders(settings.content || '', placeholders);

    const embed = new EmbedBuilder()
        .setColor(settings.color || '#FF69B4')
        .setTitle(title || 'Chào mừng!')
        .setDescription(description || 'Chào mừng {user} đến với server!')
        .setFooter({ text: settings.footer || 'Mimi Bot', iconURL: settings.footer_icon && isImageUrl(settings.footer_icon) ? settings.footer_icon : undefined })
        .setTimestamp();

    let thumbnailUrl;
    if (settings.thumbnail === 'user_avatar') {
        thumbnailUrl = member.user.displayAvatarURL({ format: 'png', size: 256 });
    } else if (settings.thumbnail === 'server_avatar') {
        thumbnailUrl = member.guild.iconURL({ dynamic: true });
    } else {
        thumbnailUrl = settings.thumbnail && isImageUrl(settings.thumbnail) ? settings.thumbnail : 'https://thanhxuan.xyz/banner.jpg';
    }

    const imageUrl = settings.image && isImageUrl(settings.image) ? settings.image : 'https://thanhxuan.xyz/banner.jpg';

    embed.setThumbnail(thumbnailUrl);
    embed.setImage(imageUrl);

    if (settings.author === 'user_author') {
        embed.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() });
    } else if (settings.author) {
        embed.setAuthor({ name: settings.author, iconURL: settings.author_icon && isImageUrl(settings.author_icon) ? settings.author_icon : undefined });
    }

    const channel = member.guild.channels.cache.get(settings.channel_id);
    if (channel && channel.isTextBased()) {
        channel.send({ content: content, embeds: [embed] });
    }
});


client.on('guildMemberRemove', async (member) => {
    const settings = await getLeaveSettings(member.guild.id);

    if (!settings || !settings.enabled) return;

    const placeholders = {
        '{userName}': member.user.username,
        '{userID}': member.user.id,
        '{userTag}': `<@${member.user.id}>`,
        '{stt}': member.guild.memberCount,
        '{sttF}': member.guild.members.cache.filter(m => !m.user.bot).size
    };

    const title = replacePlaceholders(settings.title || '', placeholders);
    const description = replacePlaceholders(settings.description || '', placeholders);
    const content = replacePlaceholders(settings.content || '', placeholders);

    const embed = new EmbedBuilder()
        .setColor(settings.color || '#FF69B4')
        .setTitle(title || 'Tạm biệt!')
        .setDescription(description || 'Thành viên {user} đã rời khỏi server!')
        .setFooter({ text: settings.footer || 'Mimi Bot', iconURL: settings.footer_icon && isImageUrl(settings.footer_icon) ? settings.footer_icon : undefined })
        .setTimestamp();

    let thumbnailUrl;
    if (settings.thumbnail === 'user_avatar') {
        thumbnailUrl = member.user.displayAvatarURL({ format: 'png', size: 256 });
    } else if (settings.thumbnail === 'server_avatar') {
        thumbnailUrl = member.guild.iconURL({ dynamic: true });
    } else {
        thumbnailUrl = settings.thumbnail && isImageUrl(settings.thumbnail) ? settings.thumbnail : 'https://thanhxuan.xyz/leave_banner.jpg';
    }

    const imageUrl = settings.image && isImageUrl(settings.image) ? settings.image : 'https://thanhxuan.xyz/leave_banner.jpg';

    embed.setThumbnail(thumbnailUrl);
    embed.setImage(imageUrl);

    if (settings.author === 'user_author') {
        embed.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() });
    } else if (settings.author) {
        embed.setAuthor({ name: settings.author, iconURL: settings.author_icon && isImageUrl(settings.author_icon) ? settings.author_icon : undefined });
    }

    const channel = member.guild.channels.cache.get(settings.channel_id);
    if (channel && channel.isTextBased()) {
        channel.send({ content: content, embeds: [embed] });
    }
});

// const logMessage = async (guildId, embed) => {
//     dataBetaDev.get(`SELECT log_channel_id FROM guild_settings WHERE guild_id = ?`, [guildId], (err, row) => {
//         if (err) {
//             return console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
//         }
//         if (row) {
//             const logChannel = client.channels.cache.get(row.log_channel_id);
//             if (logChannel) {
//                 logChannel.send({ embeds: [embed] }).catch(error => {
//                     console.error(`Không thể gửi tin nhắn đến kênh: ${error}`);
//                 });
//             }
//         }
//     });
// };


// const logVoice = async (guildId, embed) => {
//     dataBetaDev.get(`SELECT voice_log_channel_id FROM guild_settings WHERE guild_id = ?`, [guildId], (err, row) => {
//         if (err) {
//             return console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
//         }
//         if (row) {
//             const voiceLogChannel = client.channels.cache.get(row.voice_log_channel_id);
//             if (voiceLogChannel) {
//                 voiceLogChannel.send({ embeds: [embed] }).catch(error => {
//                     console.error(`Không thể gửi tin nhắn đến kênh: ${error}`);
//                 });
//             }
//         }
//     });
// };

const logMessage = async (guildId, embed) => {
    dataBetaDevs.query(`SELECT log_channel_id FROM guild_settings WHERE guild_id = ?`, [guildId], (err, results) => {
        if (err) {
            return console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
        }
        if (results.length > 0) {
            const logChannel = client.channels.cache.get(results[0].log_channel_id);
            if (logChannel) {
                logChannel.send({ embeds: [embed] }).catch(error => {
                    console.error(`Không thể gửi tin nhắn đến kênh: ${error}`);
                });
            }
        }
    });
};

const logVoice = async (guildId, embed) => {
    dataBetaDevs.query(`SELECT voice_log_channel_id FROM guild_settings WHERE guild_id = ?`, [guildId], (err, results) => {
        if (err) {
            return console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
        }
        if (results.length > 0) {
            const voiceLogChannel = client.channels.cache.get(results[0].voice_log_channel_id);
            if (voiceLogChannel) {
                voiceLogChannel.send({ embeds: [embed] }).catch(error => {
                    console.error(`Không thể gửi tin nhắn đến kênh: ${error}`);
                });
            }
        }
    });
};


// Log tin nhắn chỉnh sửa
// client.on('messageUpdate', (oldMessage, newMessage) => {
//     if (oldMessage.partial || oldMessage.author.bot || oldMessage.content === newMessage.content) return;
//     logChatCommand.logUpdate(oldMessage, newMessage);
// });

// Lắng nghe sự kiện xóa tin nhắn
// client.on('messageDelete', async message => {

//         if (message.bot) return;
//         // logChatCommand.logDelete(message);
//         if (!message.guild || !message.author || message.author.bot) return;

//         const userId = message.author.id;
//         const username = message.author.tag;
//         const avatarUrl = message.author.displayAvatarURL();
//         const content = message.content || 'Không có nội dung';
//         const timestamp = Date.now();
//         const guildId = message.guild.id;

//         // Lấy danh sách các tệp đính kèm (ảnh, GIF, video,...)
//     const attachments = message.attachments.size > 0
//         ? message.attachments.map(attachment => attachment.url).join(', ')
//         : null;

//     dataBetaDev.run(`INSERT INTO deleted_messages (user_id, username, avatar_url, content, timestamp, guild_id, attachments) 
//         VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [userId, username, avatarUrl, content, timestamp, guildId, attachments]);
// });
client.on('messageDelete', async message => {

        if (message.bot) return;
        // logChatCommand.logDelete(message);
        if (!message.guild || !message.author || message.author.bot) return;

        const userId = message.author.id;
        const username = message.author.tag;
        const avatarUrl = message.author.displayAvatarURL();
        const content = message.content || 'Không có nội dung';
        const timestamp = Date.now();
        const guildId = message.guild.id;

        // Lấy danh sách các tệp đính kèm (ảnh, GIF, video,...)
    const attachments = message.attachments.size > 0
        ? message.attachments.map(attachment => attachment.url).join(', ')
        : null;

    dataBetaDevs.query(`INSERT INTO deleted_messages (user_id, username, avatar_url, content, timestamp, guild_id, attachments) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, avatarUrl, content, timestamp, guildId, attachments], (err) => {
        if (err) console.error('Lỗi khi chèn dữ liệu:', err);
    });

});

// The interactionCreate event directly here, as this is the heart of the robot.
client.on('interactionCreate', async (interaction) => {
    // if (interaction.isButton() || interaction.isModalSubmit()) {
    //     await handleInteraction(interaction);
    //     await handleModalSubmit(interaction);
    // }
    
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return

    // We log when a user makes a command
    try {
        await console.log(
            `[${interaction.guild.name}] ${interaction.user.username} used /${interaction.commandName}`
        )
        await command.execute(interaction, client)
        // But if there is a mistake, 
        // then we log that and send an error message only to the person (ephemeral: true)
    } catch (error) {
        console.error(error)
        return interaction.reply({
            content: "An error occurred while executing this command!",
            ephemeral: true,
            fetchReply: true
        })
    }
})

const botListFilePath = './data/botList.json';
let botList = {};

// Đọc danh sách bot từ file JSON khi khởi động
if (fs.existsSync(botListFilePath)) {
    botList = JSON.parse(fs.readFileSync(botListFilePath, 'utf-8'));
}

// Hàm lưu danh sách bot vào file JSON
function saveBotList() {
    fs.writeFileSync(botListFilePath, JSON.stringify(botList, null, 2));
}

// Log hoạt động voice
client.on('voiceStateUpdate', async (oldState, newState) => {
    const guildId = newState.guild.id;
    
    // Kiểm tra nếu là bot
    if (newState.member.user.bot) {
        if (!botList[guildId]) {
            botList[guildId] = [];
        }

        const botId = newState.member.id;

        // Nếu bot tham gia vào kênh voice và chưa có trong danh sách
        if (newState.channelId && !botList[guildId].includes(botId)) {
            botList[guildId].push(botId);  // Thêm bot vào danh sách
        }

        // Nếu bot rời khỏi kênh voice, không xóa khỏi danh sách, chỉ để cập nhật trạng thái rảnh
        // Không cần xóa bot khỏi danh sách vì bot vẫn còn trong server
        saveBotList();  // Lưu lại danh sách sau khi cập nhật
    }

      
  if (newState.channelId && !oldState.channelId) {
    // User joined a voice channel
    dbLove.run(`INSERT OR REPLACE INTO voice_status (user_id, channel_id, join_time) VALUES (?, ?, ?)`, [newState.id, newState.channelId, new Date().toISOString()]);
  } else if (!newState.channelId && oldState.channelId) {
    // User left a voice channel
    dbLove.run(`DELETE FROM voice_status WHERE user_id = ?`, [newState.id]);
  } else if (newState.channelId && oldState.channelId && newState.channelId !== oldState.channelId) {
    // User switched voice channels
    dbLove.run(`UPDATE voice_status SET channel_id = ?, join_time = ? WHERE user_id = ?`, [newState.channelId, new Date().toISOString(), newState.id]);
  }
    // logVoiceCommand.logVoiceUpdate(oldState, newState);
});



const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET
});

let spotifyAccessToken = '';

async function setSpotifyToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyAccessToken = data.body['access_token'];
        spotifyApi.setAccessToken(spotifyAccessToken);
        console.log('Spotify access token set');
    } catch (error) {
        console.error('Error setting Spotify access token', error);
    }
}

// Thiết lập token ngay khi bot khởi động và sau mỗi 1 giờ
setSpotifyToken();
setInterval(setSpotifyToken, 3600 * 1000);

// client.on(VoiceConnectionStatus.Disconnected, (oldState, newState) => {
//     clearQueue(newState.channel.guild.id);
// });

// client.on(VoiceConnectionStatus.Destroyed, (oldState, newState) => {
//     clearQueue(newState.channel.guild.id);
// });

(async () => {

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
}

const commands2Path = path.join(__dirname, 'cmds');

// Hàm đệ quy để lấy tất cả các tệp lệnh từ các thư mục con
function getAllCommandFiles(dir) {
    let commandFiles = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            commandFiles = commandFiles.concat(getAllCommandFiles(filePath));
        } else if (file.endsWith('.js')) {
            commandFiles.push(filePath);
        }
    }

    return commandFiles;
}

// Lấy tất cả các tệp lệnh từ thư mục cmds và các thư mục con
const command2Files = getAllCommandFiles(commands2Path);

function loadCommand(filePath) {
    try {
        delete require.cache[require.resolve(filePath)]; // Xóa cache của module

        const command2 = require(filePath);
        if ('name' in command2 && 'execute' in command2) {
            client.commands2.set(command2.name, command2);
            if (command2.aliases && Array.isArray(command2.aliases)) {
                command2.aliases.forEach(alias => client.aliases.set(alias, command2.name));
            }
        } else {
            console.log(`[CẢNH BÁO] Lệnh tại ${filePath} thiếu thuộc tính "name" hoặc "execute".`);
        }
    } catch (error) {
        console.error(`Không thể tải lại lệnh tại ${filePath}:`, error);
    }
}

// Tải tất cả các lệnh khi bot khởi động
for (const filePath of command2Files) {
    loadCommand(filePath);
}

// Sử dụng chokidar để theo dõi sự thay đổi của các tệp lệnh
const watcher = chokidar.watch(commands2Path, {
    persistent: true,
    ignoreInitial: true
});

watcher.on('change', filePath => {
    console.log(`[TẢI LẠI] Phát hiện thay đổi tại ${filePath}. Tải lại lệnh...`);
    loadCommand(filePath); // Tải lại lệnh khi có sự thay đổi
});

// Đường dẫn tới thư mục cmds
// const commands2Path = path.join(__dirname, 'cmds');

// // Hàm đệ quy để lấy tất cả các tệp lệnh từ các thư mục con
// function getAllCommandFiles(dir) {
//     let commandFiles = [];
//     const files = fs.readdirSync(dir);

//     for (const file of files) {
//         const filePath = path.join(dir, file);
//         const stats = fs.statSync(filePath);

//         if (stats.isDirectory()) {
//             commandFiles = commandFiles.concat(getAllCommandFiles(filePath));
//         } else if (file.endsWith('.js')) {
//             commandFiles.push(filePath);
//         }
//     }

//     return commandFiles;
// }

// // Lấy tất cả các tệp lệnh từ thư mục cmds và các thư mục con
// const command2Files = getAllCommandFiles(commands2Path);

// for (const filePath of command2Files) {
//     const command2 = require(filePath);
//     if ('name' in command2 && 'execute' in command2) {
//         client.commands2.set(command2.name, command2);
//         if (command2.aliases && Array.isArray(command2.aliases)) {
//             command2.aliases.forEach(alias => client.aliases.set(alias, command2.name));
//         }
//     } else {
//         console.log(`[CẢNH BÁO] Lệnh tại ${filePath} thiếu thuộc tính "name" hoặc "execute".`);
//     }

//     // client.commands2.set(command2.name, command2);
// }


// Events like ready.js (when the robot turns on), 

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// function handleAutorespond(message) {
//     const query = `SELECT * FROM autorespond_embeds WHERE trigger = ? AND isActive = 1`;
//     dbBetaBot.get(query, [message.content], (err, row) => {
//         if (err) {
//             console.error('Error querying database:', err);
//             return;
//         }

//         if (row) {
//             const embed = new EmbedBuilder()
//                 .setTitle(row.title)
//                 .setDescription(row.description)
//                 .setColor(row.color);
//             if (row.image) {
//                 embed.setImage(row.image);
//             }
//             message.channel.send({ embeds: [embed] });
//         }
//     });
// }
// LOGIC GAME

function toRoman(num) {
    const romanNumerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    const integers = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    let roman = '';

    for (let i = 0; i < integers.length; i++) {
        while (num >= integers[i]) {
            roman += romanNumerals[i];
            num -= integers[i];
        }
    }

    return roman;
}

function fromRoman(roman) {
    const romanNumerals = {
        'M': 1000,
        'CM': 900,
        'D': 500,
        'CD': 400,
        'C': 100,
        'XC': 90,
        'L': 50,
        'XL': 40,
        'X': 10,
        'IX': 9,
        'V': 5,
        'IV': 4,
        'I': 1
    };

    let num = 0;
    let i = 0;

    while (i < roman.length) {
        if (i + 1 < roman.length && romanNumerals[roman.substr(i, 2)]) {
            num += romanNumerals[roman.substr(i, 2)];
            i += 2;
        } else {
            num += romanNumerals[roman[i]];
            i++;
        }
    }

    return num;
}

// Hàm kiểm tra định dạng số La Mã hợp lệ
function validateRoman(roman) {
    const romanPattern = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    return romanPattern.test(roman);
}

// function toRoman(num) {
//     const romanNumerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
//     const integers = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
//     let roman = '';

//     for (let i = 0; i < integers.length; i++) {
//         while (num >= integers[i]) {
//             roman += romanNumerals[i];
//             num -= integers[i];
//         }
//     }

//     return roman;
// }

// function fromRoman(roman) {
//     const romanNumerals = {
//         'M': 1000,
//         'CM': 900,
//         'D': 500,
//         'CD': 400,
//         'C': 100,
//         'XC': 90,
//         'L': 50,
//         'XL': 40,
//         'X': 10,
//         'IX': 9,
//         'V': 5,
//         'IV': 4,
//         'I': 1
//     };

//     let num = 0;
//     let i = 0;

//     while (i < roman.length) {
//         if (i + 1 < roman.length && romanNumerals[roman.substr(i, 2)]) {
//             num += romanNumerals[roman.substr(i, 2)];
//             i += 2;
//         } else {
//             num += romanNumerals[roman[i]];
//             i++;
//         }
//     }

//     return num;
// }

// Hàm lấy dữ liệu cấu hình của guild
const getGuildSettings = (guildId) => new Promise((resolve, reject) => {
  dbLove.get("SELECT notify_level_up, rank_channel_id, daily_exp_limit FROM guild_settings WHERE guild_id = ?", [guildId], (err, row) => {
    if (err) return reject(err);
    resolve(row ? row : { notify_level_up: 0, rank_channel_id: null, daily_exp_limit: 125000 });
  });
});

const calculateNextLevelExp = (level) => {
  if (level <= 5) return level * 20000; // Tăng từ 10000 lên 20000
  if (level <= 10) return level * 40000; // Tăng từ 20000 lên 40000
  if (level <= 15) return level * 60000; // Tăng từ 30000 lên 60000
  if (level <= 20) return level * 100000; // Tăng từ 50000 lên 100000
  if (level <= 25) return level * 150000; // Tăng từ 80000 lên 150000
  if (level <= 30) return level * 250000; // Tăng từ 120000 lên 250000
  if (level <= 35) return level * 500000; // Tăng từ 200000 lên 500000
  if (level <= 40) return level * 750000; // Tăng từ 300000 lên 750000
  if (level <= 45) return level * 1200000; // Tăng từ 500000 lên 1200000
  if (level <= 50) return level * 2000000; // Tăng từ 750000 lên 2000000
  if (level <= 55) return level * 3000000; // Tăng từ 1200000 lên 3000000
  if (level <= 60) return level * 5000000; // Tăng từ 2000000 lên 5000000
  if (level <= 65) return level * 7500000; // Tăng từ 2500000 lên 7500000
  if (level <= 70) return level * 10000000; // Tăng từ 3000000 lên 10000000
  if (level <= 75) return level * 15000000; // Tăng từ 4000000 lên 15000000
  if (level <= 80) return level * 20000000; // Tăng từ 5000000 lên 20000000
  if (level <= 85) return level * 30000000; // Tăng từ 7000000 lên 30000000
  if (level <= 90) return level * 50000000; // Tăng từ 10000000 lên 50000000
  if (level <= 95) return level * 75000000; // Tăng từ 15000000 lên 75000000
  if (level <= 100) return level * 300000000; // Tăng từ 200000000 lên 300000000
  if (level > 100) return level * 10000000000; // Tăng từ 5000000000 lên 10000000000
  return level * 10000000000;
};


// Hàm lấy dữ liệu người dùng
const getUserData = (user) => new Promise((resolve, reject) => {
  dbLove.get("SELECT level, experience, daily_exp, message_count FROM user_data WHERE user_id = ?", [user.id], (err, row) => {
    if (err) return reject(err);
    resolve(row ? row : { level: 1, experience: 0, daily_exp: 0, message_count: 0 });
  });
});

// Hàm cập nhật dữ liệu người dùng
const updateUserData = (user, level, experience, daily_exp, message_count) => new Promise((resolve, reject) => {
  dbLove.run("INSERT INTO user_data (user_id, level, experience, daily_exp, message_count) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET level = ?, experience = ?, daily_exp = ?, message_count = ?", [user.id, level, experience, daily_exp, message_count, level, experience, daily_exp, message_count], function(err) {
    if (err) return reject(err);
    resolve();
  });
});

// Hàm kiểm tra và gửi thông báo lên cấp
const sendLevelUpMessage = async (user, newLevel, reward, client, settings) => {
  if (settings.notify_level_up) {
    const embed = new EmbedBuilder()
      .setTitle('<a:hyc_decor_gavvang:1255342025046229033> Thông báo lên cấp <a:hyc_decor_gavvang:1255342025046229033>')
      .setDescription(`Chúc mừng <@${user.id}> đã đạt cấp độ ${newLevel}!\nBạn đã nhận được ${reward.toLocaleString()} <:xumimi:1261591338290511973>.`)
      .setColor('#F5B7B1');


    if (settings.rank_channel_id) {
      const rankChannel = await client.channels.fetch(settings.rank_channel_id);
      await rankChannel.send({ embeds: [embed] });
    }
  }
};

const sqlite3 = require('sqlite3').verbose();
const { createCanvas } = require('canvas');

// Kết nối với cơ sở dữ liệu SQLite
const dbCaptcha = new sqlite3.Database('./captcha.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Kết nối với cơ sở dữ liệu thành công.');
  });
  
  // Tạo bảng captcha_users
  dbCaptcha.run(`
    CREATE TABLE IF NOT EXISTS captcha_users (
      userId TEXT PRIMARY KEY,
      captcha_attempts INTEGER DEFAULT 0,
      captcha_sent_at INTEGER,
      captcha_answer TEXT,
      captcha_status TEXT DEFAULT 'pending',
      category_ban TEXT DEFAULT 'Economy',
      ban_expire_at INTEGER,
      ban_strikes INTEGER DEFAULT 0
    )
  `);

// Hàm tính toán thời gian ban dựa trên số lần bị cấm (strike count)
function getBanDuration(strikes) {
    switch (strikes) {
        case 1:
            return '1 giờ'; // Ban 1 giờ
        case 2:
            return '6 giờ'; // Ban 6 giờ
        case 3:
            return '12 giờ'; // Ban 12 giờ
        case 4:
            return '24 giờ'; // Ban 1 ngày
        case 5:
            return '6 tháng'; // Ban 6 tháng
        case 6:
            return '12 năm'; // Ban 12 năm
        case 7:
            return '1 tỷ năm'; // Ban 1 tỷ năm
        default:
            return '1 giờ'; // Ban mặc định
    }
}
  
client.on('messageCreate', async message => {
    // Kiểm tra nếu tin nhắn đến từ DM (tin nhắn riêng) và không phải từ bot
    if (message.channel.type === ChannelType.DM && !message.author.bot) { 
        const userId = message.author.id;

        // Lấy thông tin về captcha từ cơ sở dữ liệu
        dbCaptcha.get(`SELECT * FROM captcha_users WHERE userId = ?`, [userId], (err, row) => {
            if (err) throw err;

            const now = Date.now();

            // Kiểm tra nếu người dùng chưa hoàn thành captcha và đã hết thời gian
            if (row.captcha_status === 'pending' && now > row.captcha_sent_at + (5 * 60 * 1000)) {
                // Tăng số lần bị cấm và tính toán thời gian cấm
                const banStrikes = row.ban_strikes + 1;
                const banDurationInMs = getBanDurationInMs(banStrikes);
                const banEndTime = now + banDurationInMs;

                // Cập nhật trạng thái cấm trong cơ sở dữ liệu
                dbCaptcha.run(
                    `UPDATE captcha_users SET captcha_status = 'banned', category_ban = 'all', ban_strikes = ?, ban_end_time = ?, captcha_attempts = 0 WHERE userId = ?`, 
                    [banStrikes, banEndTime, userId], 
                    (err) => {
                        if (err) throw err;

                        // Gửi thông báo cho người dùng
                        const banDuration = getBanDuration(banStrikes);
                        message.reply(`Bạn đã không hoàn thành captcha trong thời gian quy định và bị cấm trong ${banDuration}. Nếu muốn kháng cáo, hãy vào server https://discord.gg/mimibot`);
                    }
                );
            } else if (message.content.trim() === row.captcha_answer.trim()) {
                // Nếu mã captcha đúng, cập nhật trạng thái xác thực thành công
                dbCaptcha.run(`UPDATE captcha_users SET captcha_status = 'verified', ban_strikes = 0, captcha_attempts = 0 WHERE userId = ?`, [userId], (err) => {
                    if (err) throw err;
                    message.reply('Bạn đã nhập đúng mã captcha. Bạn có thể tiếp tục sử dụng các lệnh.');
                });
            } else {
                // Nếu mã captcha sai, tăng số lần thử và kiểm tra
                const attempts = row.captcha_attempts + 1;
                if (attempts >= 5) {
                    // Tăng số lần bị cấm
                    const banStrikes = row.ban_strikes + 1;
                    const banDurationInMs = getBanDurationInMs(banStrikes); // Tính thời gian ban dưới dạng milliseconds
                    const banEndTime = now + banDurationInMs; // Tính thời gian kết thúc cấm

                    // Nếu vượt quá giới hạn, ban người dùng và cập nhật thời gian cấm
                    dbCaptcha.run(
                        `UPDATE captcha_users SET captcha_status = 'banned', category_ban = 'all', ban_strikes = ?, ban_end_time = ?, captcha_attempts = 0 WHERE userId = ?`, 
                        [banStrikes, banEndTime, userId], 
                        (err) => {
                            if (err) throw err;

                            // Lấy thời gian ban dưới dạng hiển thị
                            const banDuration = getBanDuration(banStrikes);
                            // Thông báo cho người dùng về thời gian bị cấm
                            message.reply(`Bạn đã nhập sai mã captcha quá nhiều lần và bị cấm trong ${banDuration}. Nếu muốn kháng cáo, hãy vào server https://discord.gg/mimibot`);
                        }
                    );
                } else {
                    // Cập nhật số lần thử không thành công
                    dbCaptcha.run(`UPDATE captcha_users SET captcha_attempts = ? WHERE userId = ?`, [attempts, userId], (err) => {
                        if (err) throw err;
                        message.reply(`Mã captcha không chính xác. Bạn còn ${5 - attempts} lần thử.`);
                    });
                }
            }
        });
    }
    // if (message.channel.type === ChannelType.DM && !message.author.bot) { 
    //     const userId = message.author.id;

    //     // Lấy thông tin về captcha từ cơ sở dữ liệu
    //     dbCaptcha.get(`SELECT * FROM captcha_users WHERE userId = ? AND captcha_status = 'pending'`, [userId], (err, row) => {
    //         if (err) throw err;

    //         if (row) {
    //             // So sánh mã captcha mà người dùng gửi với mã đã lưu
    //             if (message.content.trim() === row.captcha_answer.trim()) {
    //                 // Nếu mã captcha đúng, cập nhật trạng thái xác thực thành công
    //                 dbCaptcha.run(`UPDATE captcha_users SET captcha_status = 'verified', ban_strikes = 0 WHERE userId = ?`, [userId], (err) => {
    //                     if (err) throw err;
    //                     message.reply('Bạn đã nhập đúng mã captcha. Bạn có thể tiếp tục sử dụng các lệnh.');
    //                 });
    //             } else {
    //                 // Nếu mã captcha sai, tăng số lần thử và kiểm tra
    //                 const attempts = row.captcha_attempts + 1;
    //                 if (attempts >= 5) {
    //                     // Kiểm tra số lần bị cấm
    //                     const banStrikes = row.ban_strikes + 1;
    //                     const banDuration = getBanDuration(banStrikes); // Tính thời gian ban

    //                     // Nếu vượt quá giới hạn, ban người dùng
    //                     dbCaptcha.run(`UPDATE captcha_users SET captcha_status = 'banned', category_ban = 'all', ban_strikes = ? WHERE userId = ?`, [banStrikes, userId], (err) => {
    //                         if (err) throw err;
                            
    //                         // Thông báo cho người dùng về thời gian bị cấm
    //                         message.reply(`Bạn đã nhập sai mã captcha quá nhiều lần và bị cấm trong ${banDuration}. Nếu muốn kháng cáo, hãy vào server https://discord.gg/mimibot`);
    //                     });
    //                 } else {
    //                     // Cập nhật số lần thử không thành công
    //                     dbCaptcha.run(`UPDATE captcha_users SET captcha_attempts = ? WHERE userId = ?`, [attempts, userId], (err) => {
    //                         if (err) throw err;
    //                         message.reply(`Mã captcha không chính xác. Bạn còn ${5 - attempts} lần thử.`);
    //                     });
    //                 }
    //             }
    //         } else {
    //             // Nếu không có captcha đang chờ xử lý, bỏ qua tin nhắn DM
    //             message.reply('Hiện không có mã captcha nào đang chờ bạn xác minh.');
    //         }
    //     });
    // }
    if (message.author.bot) return;

    if (!message.author.bot) {
        const guildId = message.guild.id;
        const user = message.author;
        const settings = await getGuildSettings(guildId);
        const userData = await getUserData(user);

        // Giới hạn điểm kinh nghiệm nhận được mỗi ngày
        if (userData.daily_exp >= settings.daily_exp_limit) {
          return;
        }

        // Kiểm tra số tin nhắn và tính điểm kinh nghiệm ngẫu nhiên từ 1 đến 50
        const expGain = Math.floor(Math.random() * 50) + 1;
        const actualExpGain = Math.min(expGain, settings.daily_exp_limit - userData.daily_exp); // Đảm bảo không vượt quá giới hạn
        let newExp = userData.experience + actualExpGain;
        let newLevel = userData.level;
        let newDailyExp = userData.daily_exp + actualExpGain;
        let nextLevelExp = calculateNextLevelExp(newLevel);

        while (newExp >= nextLevelExp) {
          newExp -= nextLevelExp;
          newLevel++;
          nextLevelExp = calculateNextLevelExp(newLevel);

          // Tặng tiền cho người dùng khi lên cấp
          const reward = newLevel * 5000;
          dbLove.run("UPDATE user_money SET money = money + ? WHERE user_id = ?", [reward, user.id]);

          await sendLevelUpMessage(user, newLevel, reward, client, settings);
        }

        await updateUserData(user, newLevel, newExp, newDailyExp);
      }
    // try {
    //     const rows = await new Promise((resolve, reject) => {
    //         dataAutoReactions.all(`SELECT * FROM autoreactions WHERE guild_id = ? AND active = true`, [message.guild.id], (err, rows) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(rows);
    //             }
    //         });
    //     });

    //     for (const row of rows) {
    //         if (message.content.includes(row.trigger)) {
    //             const emojis = row.emojis.split(',').map(e => e.trim());
    //             for (const emoji of emojis) {
    //                 await message.react(emoji);
    //             }
    //         }
    //     }
    // } catch (err) {
    //     console.error(err);
    // }
    try {
            const rows = await new Promise((resolve, reject) => {
                dataBetaDev.all(`SELECT * FROM autoresponses WHERE guild_id = ?`, [message.guild.id], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            rows.forEach((row) => {
                if (message.content.includes(row.trigger)) {
                    let response = row.response;
                    response = response.replace('{user}', `<@${message.author.id}>`);

                    if (response.includes('{mention}')) {
                        const mention = message.mentions.users.first();
                        if (mention) {
                            response = response.replace('{mention}', `<@${mention.id}>`);
                        } else {
                            response = response.replace('{mention}', 'người dùng');
                        }
                    }

                    if (row.reply) {
                        message.reply(response);
                    } else {
                        message.channel.send(response);
                    }
                }
            });
        } catch (err) {
            console.error(err);
        }
    const user = message.author;
  const userId = user.id;
    const currentTime = Date.now();

    


    const channelId = message.channel.id;
    const guildId = message.guild.id;

// // Paths to your JSON files
// const wordchainChannelsFile = path.join(__dirname, './data/wordchain_channels.json');
// const romanCountingFile = path.join(__dirname, './data/roman_counting.json');
// const numberCountingFile = path.join(__dirname, './data/number_counting.json');
// const wordchainRoundsFile = path.join(__dirname, './data/wordchain_rounds.json');
// const wordchainWordsFile = path.join(__dirname, './data/wordchain_words.json');

// // Helper functions to read and write JSON
// function readJSON(filePath) {
//     if (!fs.existsSync(filePath)) {
//         fs.writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf8');
//     }
//     return JSON.parse(fs.readFileSync(filePath, 'utf8'));
// }

// function writeJSON(filePath, data) {
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
// }

//     const content = message.content.trim();

//     // Handle Wordchain Game
//     const wordchainChannels = readJSON(wordchainChannelsFile);
//     if (wordchainChannels[guildId] && wordchainChannels[guildId] === channelId) {
//         const wordchainRounds = readJSON(wordchainRoundsFile);
//         const wordchainWords = readJSON(wordchainWordsFile);

//         const round = wordchainRounds[guildId];
//         const lastWord = round?.word || '';
//         const lastUser = round?.last_user || '';

//         const word = content.toLowerCase();
        
//         if (message.author.id === lastUser) {
//             return message.react('<:x_:1257386263275634698>').then(() => 
//                 message.reply('Bạn cần đợi người tiếp theo nối từ!').then(msg => setTimeout(() => msg.delete(), 2000))
//             );
//         }

//         const usedWords = wordchainWords[guildId] || [];
//         if (usedWords.includes(word)) {
//             return message.react('<:x_:1257386263275634698>').then(() => 
//                 message.reply('Từ này đã được sử dụng rồi!').then(msg => setTimeout(() => msg.delete(), 2000))
//             );
//         }

//         usedWords.push(word);
//         wordchainWords[guildId] = usedWords;
//         wordchainRounds[guildId] = { word, last_user: message.author.id };

//         writeJSON(wordchainWordsFile, wordchainWords);
//         writeJSON(wordchainRoundsFile, wordchainRounds);

//         return message.react('<a:hyc_decor_verifypink:1255342077307392070>');
//     }

//     // Handle Roman Counting Game
//     const romanCounting = readJSON(romanCountingFile);
//     if (romanCounting[guildId] && romanCounting[guildId].channel_id === channelId) {
//         const currentNumber = romanCounting[guildId].current_number;
//         const lastUserId = romanCounting[guildId].last_user_id;

//         if (message.author.id === lastUserId) {
//             return message.reply('Bạn cần đợi người tiếp theo đoán.').then(msg => setTimeout(() => msg.delete(), 5000));
//         }

//         let nextNumber;
//         try {
//             const upperCaseRoman = content.toUpperCase();
//             if (!validateRoman(upperCaseRoman)) throw new Error("Số La Mã không hợp lệ");
//             nextNumber = fromRoman(upperCaseRoman);
//         } catch (e) {
//             return message.react('❌');
//         }

//         if (nextNumber === currentNumber + 1) {
//             romanCounting[guildId].current_number = nextNumber;
//             romanCounting[guildId].last_user_id = message.author.id;
//             writeJSON(romanCountingFile, romanCounting);
//             return message.react('✅');
//         } else {
//             return message.react('❌');
//         }
//     }

//     // Handle Regular Number Counting Game
//     const numberCounting = readJSON(numberCountingFile);
//     if (numberCounting[guildId] && numberCounting[guildId].channel_id === channelId) {
//         const currentNumber = numberCounting[guildId].current_number;
//         const lastUserId = numberCounting[guildId].last_user_id;

//         if (message.author.id === lastUserId) {
//             return message.reply('Bạn cần đợi người tiếp theo đoán.').then(msg => setTimeout(() => msg.delete(), 5000));
//         }

//         const nextNumber = parseInt(content);
//         if (isNaN(nextNumber)) {
//             return message.react('❌');
//         }

//         if (nextNumber === currentNumber + 1) {
//             numberCounting[guildId].current_number = nextNumber;
//             numberCounting[guildId].last_user_id = message.author.id;
//             writeJSON(numberCountingFile, numberCounting);
//             return message.react('✅');
//         } else {
//             return message.react('❌');
//         }
//     }
    dataBetaDev.get(`SELECT channel_id, current_number, last_user_id FROM roman_count_channels WHERE guild_id = ?`, [guildId], (err, row) => {
    if (err) {
        console.error(err);
        return;
    }

    if (!row) return; // Không có kênh nối số La Mã được thiết lập cho máy chủ này

    const channelId = row.channel_id;
    const currentNumber = row.current_number;
    const lastUserId = row.last_user_id;

    if (message.channel.id !== channelId) return; // Tin nhắn không phải từ kênh nối số La Mã

    if (message.author.id === lastUserId) {
        message.react('<a:mmb_error:1254379860101562391>');
        return message.reply('Bạn phải chờ người khác đoán trước khi bạn có thể đoán tiếp.').then(msg => setTimeout(() => msg.delete(), 5000));
    }

    let nextNumber;
    try {
        const upperCaseRoman = message.content.toUpperCase();
        if (!validateRoman(upperCaseRoman)) {
            throw new Error("Số La Mã không hợp lệ");
        }
        nextNumber = fromRoman(upperCaseRoman);
    } catch (e) {
        nextNumber = null;
    }

    if (nextNumber === currentNumber + 1) {
        dataBetaDev.run(`UPDATE roman_count_channels SET current_number = current_number + 1, last_user_id = ? WHERE guild_id = ?`, [message.author.id, guildId], (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return;
            }

            message.react('<a:hyc_decor_verifypink:1255342077307392070>');
        });
    } else {
        message.react('<a:mmb_error:1254379860101562391>');
    }
});
        dataBetaDev.get(`SELECT channel_id, current_number, last_user_id FROM count_channels WHERE guild_id = ?`, [guildId], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }
    
            if (!row) return; // Không có kênh đếm số được thiết lập cho máy chủ này
    
            const channelId = row.channel_id;
            const currentNumber = row.current_number;
            const lastUserId = row.last_user_id;
    
            if (message.channel.id !== channelId) return; // Tin nhắn không phải từ kênh đếm số
    
            if (message.author.id === lastUserId) {
                message.react('<a:mmb_error:1254379860101562391>');
                return message.reply('Bạn phải chờ người khác đoán trước khi bạn có thể đoán tiếp.').then(msg => setTimeout(() => msg.delete(), 5000));
            }
    
            let nextNumber;
            try {
                nextNumber = mathjs.evaluate(message.content);
            } catch (e) {
                nextNumber = null;
            }
    
            if (nextNumber === currentNumber + 1 || (!isNaN(message.content) && parseInt(message.content) === currentNumber + 1)) {
                dataBetaDev.run(`UPDATE count_channels SET current_number = current_number + 1, last_user_id = ? WHERE guild_id = ?`, [message.author.id, guildId], (updateErr) => {
                    if (updateErr) {
                        console.error(updateErr);
                        return;
                    }
    
                    message.react('<a:hyc_decor_verifypink:1255342077307392070>');
                });
            } else {
                message.react('<a:mmb_error:1254379860101562391>');
            }
        });

    dataBetaDev.get(`SELECT channel_id FROM wordchain_channels WHERE guild_id = ?`, [guildId], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }

            if (!row) return; // Không có kênh nối chữ được thiết lập cho máy chủ này

            const channelId = row.channel_id;

            if (message.channel.id !== channelId) return; // Tin nhắn không phải từ kênh nối chữ

            // Xử lý trò chơi nối chữ
            const word = message.content.trim().toLowerCase();

            dataBetaDev.get(`SELECT word, last_user, round_number FROM wordchain_rounds WHERE guild_id = ?`, [guildId], (err, round) => {
                if (err) {
                    console.error(err);
                    return;
                }

                if (!round) return;

                const lastWord = round.word;
                const lastUser = round.last_user;
                const roundNumber = round.round_number;

                if (lastUser === message.author.id) {
                    message.react('<:x_:1257386263275634698>');
                    message.reply('Vui lòng đợi người tiếp theo nối chữ!').then(msg => setTimeout(() => msg.delete(), 2000));
                    return;
                }
                dataBetaDev.get(`SELECT state FROM toggle_states WHERE guild_id = ?`, [message.guild.id], (err, row) => {
                    if (err) {
                        console.error('Error fetching toggle state:', err);
                        return;
                    }

                    if (row && row.state && lastWord[lastWord.length - 1] !== word[0] ) {
                        message.react('<:x_:1257386263275634698>');
                        message.reply('Từ này không nối được với từ trước, và bị mất chuỗi win!').then(msg => setTimeout(() => msg.delete(), 2000));
                        resetGame(message.channel, guildId);
                        return;
                    }else if (row && row.state && !wordsE.includes(word)) {
                        message.react('<:x_:1257386263275634698>');
                        message.reply('Từ này không có trong từ điển tiếng Anh, và bị mất chuỗi win!').then(msg => setTimeout(() => msg.delete(), 2000));
                        resetGame(message.channel, guildId);
                        return;
                    }
                    // else if (lastWord[lastWord.length - 1] !== word[0]) {
                    //     message.react('<:x_:1257386263275634698>');
                    //     message.reply('Từ này không nối được với từ trước, và bị mất chuỗi win!').then(msg => setTimeout(() => msg.delete(), 2000));
                    //     resetGame(message.channel, guildId);
                    //     return;
                    // }
                    if (!wordsE.includes(word)) {
                        message.react('<:x_:1257386263275634698>');
                        message.reply('Từ này không có trong từ điển tiếng Anh!').then(msg => setTimeout(() => msg.delete(), 2000));
                        // resetGame(message.channel, guildId);
                        return;
                    }
                    if (lastWord[lastWord.length - 1] !== word[0]) {
                        message.react('<:x_:1257386263275634698>');
                        message.reply('Từ này không nối được với từ trước!').then(msg => setTimeout(() => msg.delete(), 5000));
                        // resetGame(message.channel, guildId);
                        return;
                    }


                    dataBetaDev.all(`SELECT word FROM wordchain_words WHERE guild_id = ?`, [guildId], (err, words) => {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        if (words.map(w => w.word).includes(word)) {
                            message.react('<:x_:1257386263275634698>');
                            message.reply('Từ này đã được sử dụng rồi!').then(msg => setTimeout(() => msg.delete(), 2000));
                            return;
                        }

                        const newRoundNumber = roundNumber + 1;
                        dataBetaDev.run(`INSERT INTO wordchain_words (guild_id, word) VALUES (?, ?)`, [guildId, word]);
                        dataBetaDev.run(`UPDATE wordchain_rounds SET word = ?, last_user = ?, round_number = ? WHERE guild_id = ?`, [word, message.author.id, newRoundNumber, guildId], (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }

                            message.react('<a:hyc_decor_verifypink:1255342077307392070>');
                            const emojis = newRoundNumber.toString().split('').map(num => numberEmojis[parseInt(num)]).join(' ');
                            emojis.split(' ').forEach(async emoji => await message.react(emoji));
                        });
                    });
                });
            });
        });

    dataBetaDev.all(`SELECT * FROM autoimages WHERE guild_id = ?`, [guildId], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        rows.forEach((row) => {
            const trigger = row.trigger.toLowerCase();
            const content = message.content.toLowerCase();

            let shouldSendImage = false;

            switch (row.filter_mode) {
                case 'exact':
                    if (content === trigger) shouldSendImage = true;
                    break;
                case 'contains':
                    if (content.includes(trigger)) shouldSendImage = true;
                    break;
                case 'equivalent':
                    if (content.split(' ').includes(trigger)) shouldSendImage = true;
                    break;
                default:
                    if (content.includes(trigger)) shouldSendImage = true;
            }

            if (shouldSendImage) {
                if (row.reply) {
                    message.reply({ files: [row.image_url] });
                } else {
                    message.channel.send({ files: [row.image_url] });
                }
            }
        });
    });
    // const userId = message.author.id;

    const afkUser = await getAFK(userId);
    if (afkUser) {
        const afkMentions = await getAFKMentions(userId);
        if (afkMentions.length > 0) {
            const mentionMessages = afkMentions.map(mention => {
                return `Bạn đã được tag bởi <@${mention.mentioner_id}> trong tin nhắn: [đây](https://discord.com/channels/${message.guild.id}/${mention.channel_id}/${mention.message_id}) - Nội dung: ${mention.content}`;
            }).join('\n');

            message.reply(`Bạn đã thoát chế độ AFK. Đây là các tin nhắn bạn bị tag trong thời gian AFK:\n${mentionMessages}`);
            await removeAFKMentions(userId);
        }
        await removeAFK(userId);
    }
    try {
            const rows = await new Promise((resolve, reject) => {
                dataBetaDev.all(`SELECT * FROM autorvesponses WHERE guild_id = ?`, [message.guild.id], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            rows.forEach((row) => {
                if (message.content.includes(row.trigger)) {
                    let response = row.response;
                    response = response.replace('{user}', `<@${message.author.id}>`);

                    if (response.includes('{mention}')) {
                        const mention = message.mentions.users.first();
                        if (mention) {
                            response = response.replace('{mention}', `<@${mention.id}>`);
                        } else {
                            response = response.replace('{mention}', 'người dùng');
                        }
                    }

                    if (row.reply) {
                        message.reply(response);
                    } else {
                        message.channel.send(response);
                    }
                }
            });
        } catch (err) {
            console.error(err);
        }


dataBetaDev.get(`SELECT prefix FROM prefixes WHERE guild_id = ?`, [message.guild.id], (err, row) => {
        if (err) {
            console.error(err);
            prefix = defaultPrefix; // Sử dụng prefix mặc định nếu có lỗi
        } else {
            prefix = row ? row.prefix : defaultPrefix;
        }
    if (!message.content.startsWith(prefix) && !message.mentions.has(client.user)) return;
        if (message.author.bot) return;
        const botMember = message.guild.members.cache.get(client.user.id);
    const channelPermissions = botMember.permissionsIn(message.channel);

    const missingPermissions = [];

    // Kiểm tra các quyền cần thiết
    if (!channelPermissions.has(PermissionsBitField.Flags.SendMessages)) {
        missingPermissions.push('SendMessages');
    }

    if (!channelPermissions.has(PermissionsBitField.Flags.EmbedLinks)) {
        missingPermissions.push('EmbedLinks');
    }

    if (!channelPermissions.has(PermissionsBitField.Flags.UseExternalEmojis)) {
        missingPermissions.push('UseExternalEmojis');
    }

    if (missingPermissions.length > 0) {
        const missingPermsMessage = `Bot không có các quyền sau trong kênh này: ${missingPermissions.join(', ')}.\nVui lòng thêm quyền để sử dụng lệnh đó.`;
        const guildName = message.guild.name;
        const guildIconURL = message.guild.iconURL();
        const channelLink = `<#${message.channel.id}>`;

        // Tạo embed với màu hồng pastel
        const embed = new EmbedBuilder()
            .setColor('#FFB6C1') // Màu hồng pastel
            .setTitle('Thông báo về quyền hạn của bot')
            .setDescription(missingPermsMessage)
            .addFields(
                { name: 'Tên server', value: guildName },
                { name: 'Kênh', value: channelLink }
            )
            .setThumbnail(guildIconURL);

        // Gửi tin nhắn riêng cho người gọi lệnh bằng embed
        if (message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && 
            message.member.permissions.has(PermissionsBitField.Flags.ManageMessages &&
            message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))) {
            try {
                message.author.send({ embeds: [embed] });
                console.log('Đã gửi tin nhắn riêng cho người gọi lệnh.');
            } catch (error) {
                console.error('Không thể gửi tin nhắn riêng:', error);
            }
        }
        return; // Dừng xử lý lệnh vì bot không có đủ quyền
    }
    const args = message.content.startsWith(prefix)
    ? message.content.slice(prefix.length).trim().split(/ +/)
    : message.content.split(/ +/).slice(1);

    const commandName = args.shift().toLowerCase();

    const command = client.commands2.get(commandName) || client.commands2.get(client.aliases.get(commandName)) || client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

    if (!command) return;

    const now = Date.now();
    const timestamps = cooldowns.get(command.name) || new Collection();
    const cooldownAmount = (command.cooldown || 1) * 1000;

    // Check if the user is the one to bypass the cooldown
    if (message.author.id !== '1145030539074600970') {
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = Math.ceil((expirationTime - now) / 1000);
                message.reply(`Xin hãy chờ <t:${Math.floor(expirationTime / 1000)}:R> nữa trước khi sử dụng lệnh \`${command.name}\` một lần nữa.`).then(msg => setTimeout(() => msg.delete(), expirationTime - now));
                return;
            }
        }
        timestamps.set(message.author.id, now);
        cooldowns.set(command.name, timestamps);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    // Kiểm tra quyền Manager Server
    const isManager = message.member.permissions.has(PermissionsBitField.Flags.ManageGuild);

    // Kiểm tra nếu lệnh bị disable trong kênh này và người dùng không phải manager
    const { commands: disabledCommands, categories: disabledCategories } = getDisabledCommands(message.guild.id, message.channel.id);

    const scammerManager = require('./scammerManager');

    // Các nhóm lệnh bị cấm đối với scammer
    const bannedCommandGroupsForScammers = ['Economy'];

    getDisabledCommands(message.guild.id, message.channel.id).then(({ commands: disabledCommands, categories: disabledCategories }) => {

        // Đảm bảo rằng disabledCommands và disabledCategories luôn là mảng
        if (!Array.isArray(disabledCommands) || !Array.isArray(disabledCategories)) {
            console.error('disabledCommands or disabledCategories is not an array:', { disabledCommands, disabledCategories });
            return;
        }

        if (!isManager && (disabledCommands.includes(command.name) || disabledCategories.includes(command.category))) {
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setDescription(`Lệnh \`${command.name}\` đã bị vô hiệu hóa trong kênh này.`);

            message.reply({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            }).catch(console.error);

            return;
        }

        // Kiểm tra xem user có trong danh sách scammer không
        if (scammerManager.isScammer(message.author.id)) {
            // Kiểm tra xem lệnh có thuộc nhóm bị cấm không
            if (bannedCommandGroupsForScammers.includes(command.category)) {
                return message.reply('Bạn đã bị đưa vào danh sách `Scammer` do gần đây bạn đã lừa mua bán tiền ảo Mimi!');
            }
        }

        // ** Thêm logic kiểm tra captcha và xử lý spam **

        dbCaptcha.get(`SELECT * FROM captcha_users WHERE userId = ? AND captcha_status = 'banned'`, [message.author.id], (err, row) => {
            if (err) throw err;

            if (row) {
                return message.reply('Bạn đã bị cấm sử dụng các lệnh do không hoàn thành xác minh captcha.');
            }

            dbCaptcha.get(`SELECT * FROM captcha_users WHERE userId = ?`, [message.author.id], async (err, row) => {
                if (err) throw err;

                if (row && row.captcha_status === 'pending') {
                    const remainingTime = row.captcha_sent_at + 5 * 60 * 1000 - Date.now();
                    if (remainingTime > 0) {
                        return message.reply(`Bạn đang bị yêu cầu giải captcha, thời gian còn lại là <t:${Math.floor(row.captcha_sent_at / 1000) + 5 * 60}:R>.`);
                    } else {
                        // Nếu hết thời gian, cấm người dùng
                        const banStrikes = row.ban_strikes + 1;  // Tăng số lần bị cấm
                        const banDuration = getBanDurationInMs(banStrikes);  // Lấy thời gian cấm tương ứng
                        const banEndTime = Date.now() + banDuration;  // Tính thời gian kết thúc cấm

                        // Cập nhật trạng thái cấm và thời gian kết thúc cấm trong cơ sở dữ liệu
                        dbCaptcha.run(`UPDATE captcha_users SET captcha_status = 'banned', category_ban = 'all', ban_strikes = ?, ban_end_time = ? WHERE userId = ?`, 
                            [banStrikes, banEndTime, message.author.id], (err) => {
                                if (err) throw err;

                                // Thông báo cho người dùng về thời gian bị cấm và cung cấp link kháng cáo
                                const banDurationFormatted = getBanDuration(banStrikes);  // Lấy thời gian cấm dạng hiển thị
                                return message.reply(`Bạn đã không hoàn thành captcha và bị cấm trong ${banDurationFormatted}. Nếu muốn kháng cáo, hãy vào server https://discord.gg/mimibot`);
                            });
                    }
                }

                // Nếu người dùng đã được gửi captcha trước đó, chỉ cần thông báo thay vì gửi lại
                if (row && row.captcha_status === 'pending') {
                    return message.reply('Mã captcha đã được gửi, vui lòng kiểm tra tin nhắn riêng (DM) và nhập mã.');
                }

                // Kiểm tra xem người dùng có spam khi sử dụng lệnh không
                if (isSpamming(message)) {
                    await sendCaptchaChallenge(message.author);
                } else {
                    // Nếu không có spam và không có captcha, thực thi lệnh bình thường
                    command.execute(message, args, spotifyApi, client, afkUsers, prefixes, savePrefixes).catch(error => {
                        console.error('Error executing command:', error);
                        const embed = new EmbedBuilder()
                            .setColor('#FF69B4')
                            .setDescription('Đã xảy ra lỗi khi thực hiện lệnh này.\nNếu lỗi do sài lệnh `loveinfo` thì set about hoặc love lại nhé!');

                        message.reply({ embeds: [embed] }).then(msg => {
                            setTimeout(() => msg.delete(), 5000);
                        }).catch(console.error);
                    });
                }
            });
        });
    }).catch(error => {
        console.error('Error getting disabled commands:', error);
    });


    function getBanDurationInMs(strikes) {
        switch (strikes) {
            case 1:
                return 1 * 60 * 60 * 1000;  // 1 giờ
            case 2:
                return 6 * 60 * 60 * 1000;  // 6 giờ
            case 3:
                return 12 * 60 * 60 * 1000; // 12 giờ
            case 4:
                return 24 * 60 * 60 * 1000; // 1 ngày
            case 5:
                return 6 * 30 * 24 * 60 * 60 * 1000;  // 6 tháng
            case 6:
                return 12 * 365 * 24 * 60 * 60 * 1000; // 12 năm
            case 7:
                return 1e12 * 365 * 24 * 60 * 60 * 1000;  // 1 tỷ năm
            default:
                return 1 * 60 * 60 * 1000;  // Ban mặc định 1 giờ
        }
    }


    // Hàm kiểm tra người dùng spam tin nhắn khi sử dụng lệnh
    function isSpamming(message) {
        const spamLimit = 10;  // Giới hạn số lần thực hiện lệnh
        const timeLimit = 60000;  // 10 giây

        if (!message.author.spamData) {
            message.author.spamData = { count: 1, lastCommand: Date.now() };
            return false;
        }

        const { count, lastCommand } = message.author.spamData;

        if (Date.now() - lastCommand < timeLimit) {
            message.author.spamData.count = count + 1;
            if (count + 1 > spamLimit) return true;
        } else {
            message.author.spamData = { count: 1, lastCommand: Date.now() };
        }

        return false;
    }

    // Hàm gửi captcha qua DM khi phát hiện spam
    async function sendCaptchaChallenge(user) {
        const captchaText = generateCaptchaText();
        const captchaImage = await generateCaptchaImage(captchaText);

        try {
            // Gửi ảnh captcha qua DM
            await user.send({ files: [{ attachment: captchaImage, name: 'captcha.png' }] });
            await user.send('Vui lòng nhập mã captcha ở đây.');

            // Lưu thông tin captcha vào cơ sở dữ liệu
            dbCaptcha.run(
                `INSERT OR REPLACE INTO captcha_users (userId, captcha_attempts, captcha_sent_at, captcha_answer, captcha_status) VALUES (?, 0, ?, ?, 'pending')`,
                [user.id, Date.now(), captchaText]
            );
        } catch (error) {
            console.error('Không thể gửi captcha qua DM:', error);
        }
    }

    // Tạo văn bản captcha
    function generateCaptchaText() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars[Math.floor(Math.random() * chars.length)];
        }
        return captcha;
    }

    // Tạo ảnh captcha bằng Canvas
    async function generateCaptchaImage(text) {
        const canvas = createCanvas(200, 100);
        const ctx = canvas.getContext('2d');

        // Vẽ nền
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Thêm nhiễu
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.3)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Vẽ mã captcha
        ctx.font = '40px sans-serif';
        ctx.fillStyle = '#000000';
        ctx.fillText(text, 50, 60);

        return canvas.toBuffer();
    }

            // Kiểm tra nếu lệnh hoặc category của lệnh đang bị vô hiệu hóa trong kênh này
    // if (commandName !== 'listdisable' && commandName !== 'disable' && commandName !== 'enable') {
    //     dbconfigcommands.get(`SELECT * FROM disabled_commands WHERE guildId = ? AND channelId = ? AND commandName = ?`, 
    //         [message.guild.id, message.channel.id, commandName], (err, row) => {
    //             if (err) {
    //                 console.error('Đã xảy ra lỗi khi truy cập cơ sở dữ liệu:', err);
    //                 return;
    //             }

    //             if (row) {
    //                 const embed = new EmbedBuilder()
    //                     .setDescription('Lệnh này đã bị vô hiệu hóa trong kênh này.')
    //                     .setColor(0xFFC0CB);

    //                 message.reply({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
    //             } else {
    //                 dbconfigcommands.get(`SELECT * FROM disabled_commands WHERE guildId = ? AND channelId = ? AND category = ?`, 
    //                     [message.guild.id, message.channel.id, command.category], (err, row) => {
    //                         if (err) {
    //                             console.error('Đã xảy ra lỗi khi truy cập cơ sở dữ liệu:', err);
    //                             return;
    //                         }

    //                         if (row) {
    //                             const embed = new EmbedBuilder()
    //                                 .setDescription('Category của lệnh này đã bị vô hiệu hóa trong kênh này.')
    //                                 .setColor(0xFFC0CB);

    //                             message.reply({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
    //                         } else {
    //                             try {
    //             command.execute(message, args, spotifyApi, client, afkUsers, prefixes, savePrefixes);
    //              } catch (error) {
    //                                 console.error('Đã xảy ra lỗi khi thực hiện lệnh:', error);
    //                                 const embed = new EmbedBuilder()
    //                                     .setDescription('Đã xảy ra lỗi khi thực hiện lệnh này.')
    //                                     .setColor(0xFFC0CB);

    //                                 message.reply({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
    //                             }
    //                         }
    //                     });
    //             }
    //         });
    // } else {
    //     try{
    //                 command.execute(message, args, spotifyApi, client, afkUsers, prefixes, savePrefixes);
    //         } catch (error) {
    //             console.error(error);
    //             const embed = new EmbedBuilder()
    //                 .setColor('#FFB6C1') // Màu hồng pastel
    //                 .setTitle('Lỗi')
    //                 .setDescription('Đã xảy ra lỗi khi thực thi lệnh này.');
    //             message.reply({ embeds: [embed] }).then(msg => {
    //                 setTimeout(() => msg.delete(), 3000);
    //             });
    //         }
    // }
    });

    const mentionedUsers = message.mentions.users;

    mentionedUsers.forEach(user => {
        dataBetaDev.get(`SELECT * FROM afk_users WHERE user_id = ?`, [user.id], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }
            if (row) {
                dataBetaDev.run(`INSERT INTO afk_tags (user_id, tagger_id, content, message_id, channel_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)`, [
                    user.id,
                    message.author.id,
                    message.content,
                    message.id,
                    message.channel.id,
                    Date.now()
                ], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
    });

    // Kiểm tra nếu người dùng AFK gửi tin nhắn
    dataBetaDev.get(`SELECT * FROM afk_users WHERE user_id = ?`, [message.author.id], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        if (row) {
            // Tăng số lượng tin nhắn của người dùng AFK
            dataBetaDev.run(`UPDATE afk_users SET message_count = message_count + 1 WHERE user_id = ?`, [message.author.id], (updateErr) => {
                if (updateErr) {
                    console.error(updateErr);
                }
            });

            // Kiểm tra nếu người dùng đã gửi quá 5 tin nhắn
            if (row.message_count + 1 > 3) {
                dataBetaDev.run(`DELETE FROM afk_users WHERE user_id = ?`, [message.author.id], (deleteErr) => {
                    if (deleteErr) {
                        console.error(deleteErr);
                    }
                });

                dataBetaDev.all(`SELECT * FROM afk_tags WHERE user_id = ?`, [message.author.id], async (tagsErr, tags) => {
                    if (tagsErr) {
                        console.error(tagsErr);
                        return;
                    }
                    dataBetaDev.run(`DELETE FROM afk_tags WHERE user_id = ?`, [message.author.id], (deleteTagsErr) => {
                        if (deleteTagsErr) {
                            console.error(deleteTagsErr);
                        }
                    });

                    if (tags.length === 0) {
                        message.reply(`Bạn đã thoát AFK và thoát AFK trong <t:${Math.floor(row.timestamp / 1000)}:R>.`);
                    } else {
                        const afkEmbed = new EmbedBuilder()
                            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                            .setTitle('AFK Logs')
                            .setDescription(`Bạn đã thoát AFK và thoát AFK trong <t:${Math.floor(row.timestamp / 1000)}:R>.`)
                            .setColor('#FFB6C1');

                        tags.forEach((tag, index) => {
                            afkEmbed.addFields({
                                name: ` `,
                                value: `${index + 1}: <@${tag.tagger_id}> - https://discord.com/channels/${message.guild.id}/${tag.channel_id}/${tag.message_id}\n${tag.content}`,
                                inline: false
                            });
                        });

                        let currentIndex = 0;
                        const rowButtons = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('previous')
                                    .setLabel('⏮')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('⬅️'),
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('⏭')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('➡️')
                            );

                        const messageWithEmbed = await message.reply({ embeds: [afkEmbed], components: [rowButtons] });

                        if (tags.length > 1) {
                            const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === message.author.id;

                            const collector = messageWithEmbed.createMessageComponentCollector({ filter, time: 60000 });

                            collector.on('collect', async i => {
                                if (i.customId === 'next') {
                                    currentIndex = (currentIndex + 1) % tags.length;
                                } else if (i.customId === 'previous') {
                                    currentIndex = (currentIndex - 1 + tags.length) % tags.length;
                                }

                                afkEmbed.fields = [];
                                afkEmbed.addFields({
                                    name: `${currentIndex + 1}) <@${tags[currentIndex].tagger_id}>`,
                                    value: `${`https://discord.com/channels/${message.guild.id}/${tags[currentIndex].channel_id}/${tags[currentIndex].message_id}`}\n${tags[currentIndex].content}`,
                                    inline: false
                                });
                                await i.update({ embeds: [afkEmbed], components: [rowButtons] });
                            });

                            collector.on('end', () => {
                                messageWithEmbed.edit({ components: [] });
                            });
                        }
                    }
                });
            }
        }
    });
    // Kiểm tra nếu người dùng đang tag người dùng AFK
    message.mentions.users.forEach(user => {
        dataBetaDev.get(`SELECT * FROM afk_users WHERE user_id = ?`, [user.id], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }

            if (row) {

                        const embedafk = new EmbedBuilder()
                            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                            .setDescription(`${user.tag} đang AFK: **${row.reason}** từ <t:${Math.floor(row.timestamp / 1000)}:R>.`)
                            .setColor('#F5B7B1');
                        message.reply({ embeds: [embedafk]});
            }
        });
    });
    const dataChannel = require(dataPath)
    const wordDataChannel = require(wordDataPath)
    const rankingData = require(rankingPath)
    const blackListWords = dictionary.getReportWords()

    global.dicData = global.dicData.filter(item => !blackListWords.includes(item))

    const checkDict = (word) => {
        return global.dicData.includes(word.toLowerCase())
    }

    // function
    const sendMessageToChannel = (msg, channel_id) => {
        client.channels.cache.get(channel_id).send({
            content: msg,
            flags: [4096]
        })
    }

    const sendAutoDeleteMessageToChannel = (msg, channel_id, seconds = 15) => {
        client.channels.cache.get(channel_id).send({
            content: msg,
            flags: [4096]
        }).then(mess => setTimeout(() => mess.delete(), 1000 * seconds))
    }

    const sendAutoDeleteMessageToChannelembed = (msg, channel_id, seconds = 6) => {
        client.channels.cache.get(channel_id).send({
            content: msg,
            flags: [4096]
        }).then(mess => setTimeout(() => mess.delete(), 1000 * seconds))
    }
 
    const isWordDataExist = (channel) => {
        return wordDataChannel[channel] !== undefined
    }

    const isGameRunning = (channel) => {
        return isWordDataExist(channel) && wordDataChannel[channel].running === true
    }

    /**
     * 
     * @param {String} word 
     * @returns {Boolean}
     */
    const checkIfHaveAnswer = (word) => {
        let w = word.split(/ +/)
        let lc = w[w.length - 1]
        for (let i = 0; i < global.dicData.length; i++) {
            queryCount++
            let temp = global.dicData[i]
            let tempw = temp.split(/ +/)
            if (tempw.length > 1 && tempw[0] === lc && temp !== word) {
                // detect word
                return true
            }
        }
        return false
    }

    const randomWord = () => {
        const wordIndex = Math.floor(Math.random() * (global.dicData.length - 1))
        queryCount += wordIndex + 1
        const rWord = global.dicData[wordIndex]
        return checkIfHaveAnswer(rWord) ? rWord : randomWord()
    }

    const startGame = (channel) => {
        let rwords = []
        let word = randomWord()
        rwords.push(word)
        wordDataChannel[channel].running = true
        wordDataChannel[channel].words = rwords
        sendMessageToChannel(`Từ bắt đầu: **${word}**`, channel)
        fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))
    }
    const stopGame = (channel) => {
        wordDataChannel[channel].running = false
        fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))
    }

    const initWordData = (channel) => {
        wordDataChannel[channel] = {
            running: false,
            currentPlayer: {},
            words: []
        }
        fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))
    }

    const initRankingData = (guild) => {
        rankingData[guild] = {
            players: []
        }
        fs.writeFileSync(rankingPath, JSON.stringify(rankingData))
    }

    // end function


    let guild = message.guild
    let channel = message.channel

    if(dataChannel[guild.id] === undefined || dataChannel[guild.id].channel === undefined) {
        // detect channel not config
        queryCount++
        return
    }
    let configChannel = dataChannel[guild.id].channel

    // FIRST LOAD
    
    if (message.content.startsWith(PREFIX_SET)) {
        let arg = message.content.trim().split(/\s+/).filter(Boolean)[1]
        // console.log(`[${message.guild.name}][${message.channel.name}] ${message.author.displayName} used prefix command [${arg ? arg : 'no action'}]`)
        if (arg === 'set') {
            if (!message.member.permissionsIn(configChannel).has(PermissionsBitField.Flags.ManageGuild)) {
                return message.reply({
                    content: 'Bạn cần có quyền `MANAGE_GUILD` để dùng lệnh này',
                    ephemeral: true
                })
            } else {
                setChannel(message.guildId, message.channelId)
                return message.reply({
                    content: `Bạn đã chọn kênh **${message.channel.name}** làm kênh nối từ của máy chủ **${message.guild.name}**. Dùng \`!start\` để bắt đầu trò chơi`,
                    ephemeral: true
                })
            }
        }
    }

    if (message.channel.id !== configChannel) return

    if(!isWordDataExist(configChannel)) {
        initWordData(configChannel)
    }

    if (rankingData[guild.id] === undefined) {
        // create ranking data for server if dont have.
        queryCount++
        initRankingData(guild.id)
    }

    let isRunning = isGameRunning(configChannel)

    if (message.content === START_COMMAND) {
        if (!isRunning) {
            sendMessageToChannel(`Trò chơi đã bắt đầu!`, configChannel)
            startGame(configChannel)
        } else sendMessageToChannel('Trò chơi vẫn đang tiếp tục. Bạn có thể dùng `!stop`', configChannel)
        return
    } else if (message.content === STOP_COMMAND) {

        if(!message.member.permissionsIn(configChannel).has(PermissionsBitField.Flags.ManageChannels)  && !message.member.roles.cache.some(role => role.name === 'Nối từ Mimi')) {
            message.reply({
                content: 'Lệnh chỉ dành cho Manager Channel hoặc có role name: `Nối từ Mimi`',
                ephemeral: true
            })
            return
        }

        if (isRunning) {
            sendMessageToChannel(`Đã kết thúc lượt này! Lượt mới đã bắt đầu!`, configChannel)
            initWordData(configChannel)
            stats.addRoundPlayedCount()
            startGame(configChannel)
        } else sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`', configChannel)
        return
    }

    if (!isRunning) {
        // check if game is running
        // sendMessageToChannel('Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`', configChannel)
        return
    }

    let currentWordData = wordDataChannel[configChannel]
    let tu = message.content.trim().toLowerCase()
    let args1 = tu.split(/\s+/).filter(Boolean) // split fix for multiple space in word.
    tu = args1.join(' ') // remake word after split.
    let words = wordDataChannel[configChannel].words

    // functions load after channel defined
    /**
     * 
     * @param {String} word 
     * @returns {Boolean}
     */
    const checkIfWordUsed = (word) => {
        for (let j = 0; j < words.length; j++) {
            queryCount++
            if (words[j] === word) {
                return true
            }
        }
    }

    /**
     * 
     * @param {String} word 
     * @returns {Boolean}
     */
    const checkIfHaveAnswerInDb = (word) => {
        let w = word.split(/ +/)
        let lc = w[w.length - 1]
        for (let i = 0; i < global.dicData.length; i++) {
            queryCount++
            let temp = global.dicData[i]
            let tempw = temp.split(/ +/)
            if (tempw.length > 1 && tempw[0] === lc && temp !== word) {
                // detect word
                if (checkIfWordUsed(temp)) {
                    // if word is used, cancel this loop round.
                    continue
                }
                return true
            }
        }
        return false
    }
    /**
     * 
     * @param {Number} userId 
     * @returns {Boolean}
     */
    const checkUserRankingDataExist = (userId) => {
        let playerArray = rankingData[message.guildId].players
        if (playerArray.length === 0) return false
        for (let i = 0; i < playerArray.length; i++) {
            queryCount++
            if (playerArray[i].id === userId) {
                return true
            }
        }
        return false
    }

    /**
     * 
     * @param {Number} userId 
     * @param {String} name 
     * @param {String|Url} avatar
     */
    const initRankDataForUser = (userId, name, avatar) => {
        rankingData[message.guildId].players.push({
            id: userId,
            win: 0,
            total: 0,
            true: 0,
            name,
            avatar
        })
        fs.writeFileSync(rankingPath, JSON.stringify(rankingData))
    }

    /**
     * 
     * @param {Number} userId 
     * @param {String} newName 
     * @param {String} newAvatar 
     */
    const updateInfoUserRankData = (userId, newName, newAvatar) => {
        for (let i = 0; i < rankingData[message.guildId].players.length; i++) {
            queryCount++
            if(rankingData[message.guildId].players[i].id === userId) {
                rankingData[message.guildId].players[i].name = newName
                rankingData[message.guildId].players[i].avatar = newAvatar
            }
        }
        fs.writeFileSync(rankingPath, JSON.stringify(rankingData))
    }

    /**
     * 
     * @param {Number} newWin
     * @param {Number} newTrue
     * @param {Number} newTotal 
     */
    const updateRankingForUser = (newWin, newTrue, newTotal) => {
        for (let i = 0; i < rankingData[message.guildId].players.length; i++) {
            queryCount++
            if(rankingData[message.guildId].players[i].id === message.author.id) {
                rankingData[message.guildId].players[i].win += newWin
                rankingData[message.guildId].players[i].true += newTrue
                rankingData[message.guildId].players[i].total += newTotal
            }
        }
        fs.writeFileSync(rankingPath, JSON.stringify(rankingData))
    }

    // end function

    if (!checkUserRankingDataExist(message.author.id)) {
        initRankDataForUser(message.author.id, message.author.displayName, message.author.avatarURL())
    } else {
        updateInfoUserRankData(message.author.id, message.author.displayName, message.author.avatarURL())
    }

    // check if words have or more than 1 space
    if (!(args1.length == 2)) {
        // message.react('<:x_:1257386263275634698>')
        // sendAutoDeleteMessageToChannel('Vui lòng nhập từ có chứa nhiều hơn 2 tiếng!', configChannel)
        return
    }

    if(words.length > 0) {
        // player can't answer 2 times
        let lastPlayerId = currentWordData.currentPlayer.id
        if (message.author.id === lastPlayerId) {
            message.react('<:x_:1257386263275634698>')
            sendAutoDeleteMessageToChannel('Bạn đã trả lời lượt trước rồi, hãy đợi đối thủ!', configChannel)
            return
        }
    }



    if (words.length > 0) {
        const lastWord = words[words.length - 1]
        const args2 = lastWord.split(/\s+/).filter(Boolean)
        if (!(args1[0] === args2[args2.length - 1]) ) {
            message.react('<:x_:1257386263275634698>')
            sendAutoDeleteMessageToChannel('Từ này không bắt đầu với `' + args2[args2.length - 1] + '`', configChannel)
            // sendMessageToChannel('Từ này không bắt đầu với tiếng `' + args2[args2.length - 1] + '`', configChannel)
            sendAutoDeleteMessageToChannelembed(`Nếu bí quá không tin được từ tiếp theo thì hãy sử dụng lệnh: \`.wc + 1 từ cần nối\`!\n\nVi dụ: \`.wc ${args2[args2.length - 1]}\` `, configChannel)
            
            return
        }
    }

    if (checkIfWordUsed(tu)) {
        message.react('<:x_:1257386263275634698>')
        sendAutoDeleteMessageToChannel('Từ này đã được sử dụng!', configChannel)
        return
    }

    if(!checkDict(tu)) {
        // check in dictionary
        message.react('<:x_:1257386263275634698>')
        updateRankingForUser(0, 0, 1)
        //sendMessageToChannel('Từ này không có trong từ điển tiếng Việt!', configChannel)
        return
    }
    const randomNumber = Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000;
    words.push(tu)
    wordDataChannel[configChannel].words = words
    wordDataChannel[configChannel].currentPlayer.id = message.author.id
    wordDataChannel[configChannel].currentPlayer.name = message.author.displayName

    fs.writeFileSync(wordDataPath, JSON.stringify(wordDataChannel))

    message.react('<a:Verify:1254379893421244427>')

    stats.addWordPlayedCount()

    updateRankingForUser(0, 1, 1)
    // console.log(`[${message.guild.name}][${message.channel.name}][#${words.length}] ${tu}`)

    if(!checkIfHaveAnswerInDb(tu)) {
        sendMessageToChannel(`<@${message.author.id}> đã chiến thắng sau ${words.length - 1} lượt!\nLượt mới đã bắt đầu!`, configChannel)
        updateRankingForUser(1, 0, 0)
        stats.addRoundPlayedCount()
        initWordData(configChannel)
        startGame(configChannel)

                // const userId = message.author.id;
                // const updateUserMoney = (userId) => new Promise((resolve, reject) => {
                //   dbLove.run("UPDATE user_money SET money = money + 5000 WHERE user_id = ?", [userId], function(err) {
                //     if (err) return reject(err);
                //     resolve();
                //   });
                // });
                // await updateUserMoney(userId);
        return
    }
    //fs.writeFileSync(queryPath, queryCount.toString())
    stats.addQuery(queryCount)
    return
    })


const process = require('process');
// Xử lý lỗi toàn cục
// Lắng nghe và xử lý lỗi 'uncaughtException'
process.on('uncaughtException', (error) => {
    if (error.code === 'SQLITE_BUSY') {
        // console.error('Lỗi không bắt được: Cơ sở dữ liệu đang bị khóa. Điều này thường xảy ra khi một tiến trình khác đang truy cập vào cơ sở dữ liệu.');
        // console.error('Cách khắc phục: Thử lại sau vài mili giây.');
    } else {
        // console.error('Lỗi không bắt được:', error);
    }
});

// Bắt sự kiện lỗi không bắt được (unhandledRejection)
process.on('unhandledRejection', (reason, promise) => {
    // console.error('Unhandled Rejection tại:', promise, 'Lý do:', reason);
});

process.on('rejectionHandled', (promise) => {
    // console.warn('Promise rejection handled late at:', promise);
});

process.on('warning', (warning) => {
    // console.warn('Warning:', warning);
});

process.on('multipleResolves', (type, promise, reason) => {
    // console.error(`Multiple resolves detected: type=${type}, promise=`, promise, 'reason=', reason);
});


function replacePlaceholders(text, placeholders) {
    return text.replace(/{\w+}/g, match => placeholders[match] || match);
}

function isImageUrl(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

// Hàm lấy danh sách các lệnh và category đã bị disable
function getDisabledCommands(guildId, channelId) {
    return new Promise((resolve, reject) => {
        dataBetaDev.get(
            `SELECT disabled_commands, disabled_categories FROM command_status WHERE guild_id = ? AND channel_id = ?`,
            [guildId, channelId],
            (err, row) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                let commands = [];
                let categories = [];

                try {
                    commands = row && row.disabled_commands ? JSON.parse(row.disabled_commands) : [];
                } catch (jsonErr) {
                    console.error('Error parsing disabled_commands:', jsonErr);
                }

                try {
                    categories = row && row.disabled_categories ? JSON.parse(row.disabled_categories) : [];
                } catch (jsonErr) {
                    console.error('Error parsing disabled_categories:', jsonErr);
                }

                resolve({ commands, categories });
            }
        );
    });
}

// --- Roman Number Counting ---
function handleRomanCounting(message, guildId, channelId, content) {
    const romanCountData = readJSON(romanCountFile);
    const channelInfo = romanCountData[guildId];

    if (!channelInfo) return; // No Roman counting channel for this guild
    const { channel_id: romanChannelId, current_number: currentNumber, last_user_id: lastUserId } = channelInfo;

    if (channelId !== romanChannelId) return; // Not the correct channel

    if (message.author.id === lastUserId) {
        message.react('<a:mmb_error:1254379860101562391>');
        return message.reply('Bạn phải chờ người khác đoán trước khi bạn có thể đoán tiếp.').then(msg => setTimeout(() => msg.delete(), 5000));
    }

    let nextNumber;
    try {
        if (!validateRoman(content)) throw new Error("Invalid Roman numeral");
        nextNumber = fromRoman(content);
    } catch (e) {
        nextNumber = null;
    }

    if (nextNumber === currentNumber + 1) {
        // Update JSON data
        romanCountData[guildId] = {
            ...channelInfo,
            current_number: nextNumber,
            last_user_id: message.author.id
        };
        writeJSON(romanCountFile, romanCountData);

        message.react('<a:hyc_decor_verifypink:1255342077307392070>');
    } else {
        message.react('<a:mmb_error:1254379860101562391>');
    }
}

// --- Regular Number Counting ---
function handleNumberCounting(message, guildId, channelId, content) {
    const countData = readJSON(countFile);
    const channelInfo = countData[guildId];

    if (!channelInfo) return; // No number counting channel for this guild
    const { channel_id: countChannelId, current_number: currentNumber, last_user_id: lastUserId } = channelInfo;

    if (channelId !== countChannelId) return; // Not the correct channel

    if (message.author.id === lastUserId) {
        message.react('<a:mmb_error:1254379860101562391>');
        return message.reply('Bạn phải chờ người khác đoán trước khi bạn có thể đoán tiếp.').then(msg => setTimeout(() => msg.delete(), 5000));
    }

    let nextNumber;
    try {
        nextNumber = parseInt(content);
    } catch (e) {
        nextNumber = null;
    }

    if (nextNumber === currentNumber + 1) {
        // Update JSON data
        countData[guildId] = {
            ...channelInfo,
            current_number: nextNumber,
            last_user_id: message.author.id
        };
        writeJSON(countFile, countData);

        message.react('<a:hyc_decor_verifypink:1255342077307392070>');
    } else {
        message.react('<a:mmb_error:1254379860101562391>');
    }
}

// --- Wordchain Game ---
function handleWordchain(message, guildId, channelId, word) {
    const wordchainChannelsData = readJSON(wordchainChannelsFile);
    const channelInfo = wordchainChannelsData[guildId];

    if (!channelInfo) return; // No wordchain channel for this guild
    const { channel_id: wordchainChannelId } = channelInfo;

    if (channelId !== wordchainChannelId) return; // Not the correct channel

    const wordchainRoundsData = readJSON(wordchainRoundsFile);
    const round = wordchainRoundsData[guildId];

    if (!round) return;

    const lastWord = round.word;
    const lastUser = round.last_user;
    const roundNumber = round.round_number;

    if (lastUser === message.author.id) {
        message.react('<:x_:1257386263275634698>');
        return message.reply('Vui lòng đợi người tiếp theo nối chữ!').then(msg => setTimeout(() => msg.delete(), 2000));
    }

    const toggleStatesData = readJSON(toggleStatesFile);
    const toggleState = toggleStatesData[guildId]?.state;
    const wordchainWordsData = readJSON(wordchainWordsFile)[guildId] || [];

    if (toggleState && lastWord[lastWord.length - 1] !== word[0]) {
        message.react('<:x_:1257386263275634698>');
        message.reply('Từ này không nối được với từ trước!').then(msg => setTimeout(() => msg.delete(), 2000));
        resetWordchain(message.channel, guildId);
        return;
    }

    if (toggleState && !wordchainWordsData.includes(word)) {
        message.react('<:x_:1257386263275634698>');
        message.reply('Từ này không có trong từ điển tiếng Anh!').then(msg => setTimeout(() => msg.delete(), 2000));
        resetWordchain(message.channel, guildId);
        return;
    }

    if (wordchainWordsData.includes(word)) {
        message.react('<:x_:1257386263275634698>');
        message.reply('Từ này đã được sử dụng rồi!').then(msg => setTimeout(() => msg.delete(), 2000));
        return;
    }

    // Add word to the used words list
    wordchainWordsData.push(word);
    const newWordchainWordsData = { ...readJSON(wordchainWordsFile), [guildId]: wordchainWordsData };
    writeJSON(wordchainWordsFile, newWordchainWordsData);

    const newRoundNumber = roundNumber + 1;
    wordchainRoundsData[guildId] = { word, last_user: message.author.id, round_number: newRoundNumber };
    writeJSON(wordchainRoundsFile, wordchainRoundsData);

    message.react('<a:hyc_decor_verifypink:1255342077307392070>');
    const emojis = newRoundNumber.toString().split('').map(num => `:${num}:`).join(' ');
    emojis.split(' ').forEach(async emoji => await message.react(emoji));
}

// Reset the wordchain game
function resetWordchain(channel, guildId) {
    const wordchainRoundsData = readJSON(wordchainRoundsFile);
    wordchainRoundsData[guildId] = { word: '', last_user: '', round_number: 1 };
    writeJSON(wordchainRoundsFile, wordchainRoundsData);
    channel.send('Chuỗi đã bị reset.');
}

// Roman numeral validation and conversion functions
function fromRoman(roman) {
    const romanNumerals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const current = romanNumerals[roman[i]];
        const next = romanNumerals[roman[i + 1]];
        if (next && current < next) {
            total -= current;
        } else {
            total += current;
        }
    }
    return total;
}

function validateRoman(roman) {
    const validRomanRegex = /^(?=[MDCLXVI])M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    return validRomanRegex.test(roman);
}

// The token of your robot to be inserted
client.login(process.env.BOT_TOKEN)

// Đặt lịch để reset điểm kinh nghiệm hàng ngày theo giờ GMT+7:00
schedule.scheduleJob('0 0 * * *', { timezone: 'Asia/Bangkok' }, () => {
  dbLove.run("UPDATE user_data SET daily_exp = 0", function(err) {
    // if (err) {
    //   console.error('Đã xảy ra lỗi khi reset giới hạn điểm kinh nghiệm hàng ngày:', err);
    // } else {
    //   console.log('Giới hạn điểm kinh nghiệm hàng ngày đã được reset.');
    // }
  });
});

})();

// Đặt lịch để reset điểm kinh nghiệm hàng ngày theo giờ GMT+7:00
// schedule.scheduleJob('0 0 * * *', { timezone: 'Asia/Bangkok' }, () => {
//   dbLove.run("UPDATE user_data SET daily_exp = 0", function(err) {
//     if (err) {
//       console.error('Đã xảy ra lỗi khi reset giới hạn điểm kinh nghiệm hàng ngày:', err);
//     } else {
//       console.log('Giới hạn điểm kinh nghiệm hàng ngày đã được reset.');
//     }
//   });
// });

// --- Roman Number Counting ---
function handleRomanCounting(message, guildId, channelId, content) {
    const romanCountData = readJSON(romanCountFile);
    const channelInfo = romanCountData[guildId];

    if (!channelInfo) return; // No Roman counting channel for this guild
    const { channel_id: romanChannelId, current_number: currentNumber, last_user_id: lastUserId } = channelInfo;

    if (channelId !== romanChannelId) return; // Not the correct channel

    if (message.author.id === lastUserId) {
        message.react('<a:mmb_error:1254379860101562391>');
        return message.reply('Bạn phải chờ người khác đoán trước khi bạn có thể đoán tiếp.').then(msg => setTimeout(() => msg.delete(), 5000));
    }

    let nextNumber;
    try {
        if (!validateRoman(content)) throw new Error("Invalid Roman numeral");
        nextNumber = fromRoman(content);
    } catch (e) {
        nextNumber = null;
    }

    if (nextNumber === currentNumber + 1) {
        // Update JSON data
        romanCountData[guildId] = {
            ...channelInfo,
            current_number: nextNumber,
            last_user_id: message.author.id
        };
        writeJSON(romanCountFile, romanCountData);

        message.react('<a:hyc_decor_verifypink:1255342077307392070>');
    } else {
        message.react('<a:mmb_error:1254379860101562391>');
    }
}

// --- Regular Number Counting ---
function handleNumberCounting(message, guildId, channelId, content) {
    const countData = readJSON(countFile);
    const channelInfo = countData[guildId];

    if (!channelInfo) return; // No number counting channel for this guild
    const { channel_id: countChannelId, current_number: currentNumber, last_user_id: lastUserId } = channelInfo;

    if (channelId !== countChannelId) return; // Not the correct channel

    if (message.author.id === lastUserId) {
        message.react('<a:mmb_error:1254379860101562391>');
        return message.reply('Bạn phải chờ người khác đoán trước khi bạn có thể đoán tiếp.').then(msg => setTimeout(() => msg.delete(), 5000));
    }

    let nextNumber;
    try {
        nextNumber = parseInt(content);
    } catch (e) {
        nextNumber = null;
    }

    if (nextNumber === currentNumber + 1) {
        // Update JSON data
        countData[guildId] = {
            ...channelInfo,
            current_number: nextNumber,
            last_user_id: message.author.id
        };
        writeJSON(countFile, countData);

        message.react('<a:hyc_decor_verifypink:1255342077307392070>');
    } else {
        message.react('<a:mmb_error:1254379860101562391>');
    }
}

// --- Wordchain Game ---
function handleWordchain(message, guildId, channelId, word) {
    const wordchainChannelsData = readJSON(wordchainChannelsFile);
    const channelInfo = wordchainChannelsData[guildId];

    if (!channelInfo) return; // No wordchain channel for this guild
    const { channel_id: wordchainChannelId } = channelInfo;

    if (channelId !== wordchainChannelId) return; // Not the correct channel

    const wordchainRoundsData = readJSON(wordchainRoundsFile);
    const round = wordchainRoundsData[guildId];

    if (!round) return;

    const lastWord = round.word;
    const lastUser = round.last_user;
    const roundNumber = round.round_number;

    if (lastUser === message.author.id) {
        message.react('<:x_:1257386263275634698>');
        return message.reply('Vui lòng đợi người tiếp theo nối chữ!').then(msg => setTimeout(() => msg.delete(), 2000));
    }

    const toggleStatesData = readJSON(toggleStatesFile);
    const toggleState = toggleStatesData[guildId]?.state;
    const wordchainWordsData = readJSON(wordchainWordsFile)[guildId] || [];

    if (toggleState && lastWord[lastWord.length - 1] !== word[0]) {
        message.react('<:x_:1257386263275634698>');
        message.reply('Từ này không nối được với từ trước!').then(msg => setTimeout(() => msg.delete(), 2000));
        resetWordchain(message.channel, guildId);
        return;
    }

    if (toggleState && !wordchainWordsData.includes(word)) {
        message.react('<:x_:1257386263275634698>');
        message.reply('Từ này không có trong từ điển tiếng Anh!').then(msg => setTimeout(() => msg.delete(), 2000));
        resetWordchain(message.channel, guildId);
        return;
    }

    if (wordchainWordsData.includes(word)) {
        message.react('<:x_:1257386263275634698>');
        message.reply('Từ này đã được sử dụng rồi!').then(msg => setTimeout(() => msg.delete(), 2000));
        return;
    }

    // Add word to the used words list
    wordchainWordsData.push(word);
    const newWordchainWordsData = { ...readJSON(wordchainWordsFile), [guildId]: wordchainWordsData };
    writeJSON(wordchainWordsFile, newWordchainWordsData);

    const newRoundNumber = roundNumber + 1;
    wordchainRoundsData[guildId] = { word, last_user: message.author.id, round_number: newRoundNumber };
    writeJSON(wordchainRoundsFile, wordchainRoundsData);

    message.react('<a:hyc_decor_verifypink:1255342077307392070>');
    const emojis = newRoundNumber.toString().split('').map(num => `:${num}:`).join(' ');
    emojis.split(' ').forEach(async emoji => await message.react(emoji));
}

// Reset the wordchain game
function resetWordchain(channel, guildId) {
    const wordchainRoundsData = readJSON(wordchainRoundsFile);
    wordchainRoundsData[guildId] = { word: '', last_user: '', round_number: 1 };
    writeJSON(wordchainRoundsFile, wordchainRoundsData);
    channel.send('Chuỗi đã bị reset.');
}

// Roman numeral validation and conversion functions
function fromRoman(roman) {
    const romanNumerals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const current = romanNumerals[roman[i]];
        const next = romanNumerals[roman[i + 1]];
        if (next && current < next) {
            total -= current;
        } else {
            total += current;
        }
    }
    return total;
}

function validateRoman(roman) {
    const validRomanRegex = /^(?=[MDCLXVI])M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    return validRomanRegex.test(roman);
}


function replacePlaceholders(text, placeholders) {
    return text.replace(/{\w+}/g, match => placeholders[match] || match);
}

function isImageUrl(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}


async function grantExperience(user) {
  try {
    const userData = await getUserData(user);
    const expGain = Math.floor(Math.random() * 50) + 1;
    let newExp = userData.experience + expGain;
    let newLevel = userData.level;
    let nextLevelExp = calculateNextLevelExp(newLevel);

    while (newExp >= nextLevelExp) {
      newExp -= nextLevelExp;
      newLevel++;
      nextLevelExp = calculateNextLevelExp(newLevel);

      // Give user money for leveling up
      const reward = newLevel * 5000;
      await updateUserMoney(user.id, reward);
      await sendLevelUpNotification(user, newLevel, reward);
    }

    await updateUserData(user, newLevel, newExp);
  } catch (error) {
    console.error('Error granting experience:', error);
  }
}

async function getUserData(user) {
  return new Promise((resolve, reject) => {
    dbLove.get("SELECT level, experience FROM user_data WHERE user_id = ?", [user.id], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row : { level: 1, experience: 0 });
    });
  });
}

async function updateUserData(user, level, experience) {
  return new Promise((resolve, reject) => {
    dbLove.run("INSERT INTO user_data (user_id, level, experience) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET level = ?, experience = ?", [user.id, level, experience, level, experience], function(err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function updateUserMoney(userId, amount) {
  return new Promise((resolve, reject) => {
    dbLove.run("UPDATE user_money SET money = money + ? WHERE user_id = ?", [amount, userId], function(err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function calculateNextLevelExp(level) {
  return Math.round(100 * Math.pow(1.15, level - 1));
}
function resetGame(channel, guildId) {
    const wordsE = fs.readFileSync(path.resolve(__dirname, './data/wordsE.txt'), 'utf-8').split('\n').map(word => word.trim().toLowerCase());
    const startingWord = wordsE[Math.floor(Math.random() * wordsE.length)]; // Chọn từ bắt đầu mới
    dataBetaDev.run(`DELETE FROM wordchain_words WHERE guild_id = ?`, [guildId], (err) => {
        if (err) {
            console.error(err);
            return;
        }
        dataBetaDev.run(`UPDATE wordchain_rounds SET word = ?, last_user = '', round_number = 1 WHERE guild_id = ?`, [startingWord, guildId], (err) => {
            if (err) {
                console.error(err);
                return;
            }
            channel.send(`Trò chơi nối chữ bắt đầu lại với từ: **${startingWord}**`);
        });
    });
}


function createEmbed(description) {
    return new EmbedBuilder()
        .setColor('#FFB6C1')
        .setDescription(description);
}
