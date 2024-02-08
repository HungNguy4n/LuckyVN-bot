;const { Client, GatewayIntentBits } = require('discord.js');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const mineflayer = require('mineflayer');
const minecraftData = require('minecraft-data');

require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const name = '_HungNguyenMC_';

const bot = mineflayer.createBot({
  host: 'Luckyvn.com',
  port: 25565,
  username: name,
  version: '1.18.2',
});

bot.on('login', () => {
  setTimeout(() => {
    bot.chat(`/login ${process.env.MINECRAFT_PASSWORD}`);
  }, 1000);
});

bot.on('spawn', () => {
  setTimeout(() => {
    bot.chat('/survival');
  }, 2000);
});

function bindEvents(bot) {

    bot.on('error', function(err) {
        console.log('Error attempting to reconnect: ' + err.errno + '.');
        if (err.code == undefined) {
            console.log('Invalid credentials OR bot needs to wait because it relogged too quickly.');
            console.log('Will retry to connect in 30 seconds. ');
            setTimeout(relog, 30000);
        }
    });

    bot.on('end', function() {
        console.log("Bot has ended");
        setTimeout(relog, 30000);  
    });
}

function relog() {
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
}

bot.loadPlugin(pathfinder);

let hubintervalId;
let foodchecktools = false;

function checkWindowForItems(window) {
  let needInventoryViewer = false;
  const Hubitems = bot.inventory.items();
  const item798 = Hubitems.find(item => item.type === 798);
  const item815 = Hubitems.find(item => item.type === 815);
  
  if (item798 && item815) {

    needInventoryViewer = false;
    setTimeout(() => {
      bot.clickWindow(15, 0, 0);
    }, 1000);
    setTimeout(() => {
      bot.clickWindow(2, 0, 0);
    }, 1000);
    hubintervalId = setInterval(() => {
      const item815s = bot.inventory.items().find(item => item.type === 815);
      const item798s = bot.inventory.items().find(item => item.type === 798);
      if (item815s && item798s) {
        bot.clickWindow(2, 0, 0);
        autodropsdisable = false;
      } else {
        clearInterval(hubintervalId); 
      }
    }, 2000);
  }
}

bot.on('windowOpen', checkWindowForItems);

let autodropsdisable = false;

function autodrops() {
  if (!autodropsdisable) {
    bot.chat('/autodrops');
    bindEvents(bot);
    autodropsdisable = true;
  }
}
setInterval(() => {
  const closestMob = bot.nearestEntity();

  if (!closestMob) return;

  const pos = closestMob.position.offset(0, closestMob.height, 0);
  const distance = bot.entity.position.distanceTo(pos);

  if (distance <= 4) {
    bot.lookAt(pos);
    const Hubitems = bot.inventory.items();
    const item798 = Hubitems.find(item => item && typeof item === 'object' && item.type === 724);
    const item707 = Hubitems.find(item => item.type === 707);

    if (!item798) {
      return;
    }

    const currentItem = bot.inventory.slots[bot.getEquipmentDestSlot('hand')];
    const desiredItemID = 798;
    const FoodtoolsID = 707;

    if ((!currentItem || currentItem.type !== desiredItemID) && !foodchecktools) {
      bot.equip(item798, 'hand');
    } else if (foodchecktools && (!currentItem || currentItem.type !== FoodtoolsID) && bot.food < 2) {
      bot.equip(item707, 'hand');
    }
    
    if (bot.food > 1 && foodchecktools) {
      foodchecktools = false;
      bot.chat(`/t ${lastestTrader} Thanh thức ăn đã tăng!`)
      bot.chat(`/trade ${lastestTrader}`)
    }
    
    setTimeout(() => {
      bot.attack(closestMob);
    }, 100);
  }
}, 400);

const targetPosition = { x: 169.5, y: 77, z: -158.5 };

function moveToTargetPosition() {
  const mcData = minecraftData(bot.version);

  const goal = new goals.GoalBlock(targetPosition.x, targetPosition.y, targetPosition.z);
  bot.pathfinder.setGoal(goal);
}

let isBotActivated = false;

function activateBotMovement() {
  if (!isBotActivated) {
    isBotActivated = true;
    setInterval(moveToTargetPosition, 1000);
    return true;
  } else {
    return false;
  }
}

let trading = false;
let hasClicked = false;

function checkChestStatus() {
  bot.on('windowOpen', (window) => {
    const chestName = window.title.toLowerCase();
    if (!trading && chestName.includes('giao dịch với')) { 
      trading = true;
      chest = window;
      tradegui();
      const intervalId = setInterval(() => {
        if (trading && !hasClicked) {
          const slot14 = window.slots[14];
          if (slot14 && slot14.type === 359) {
            bot.clickWindow(12, 0, 0);
            hasClicked = true;
          }
        } else {
          clearInterval(intervalId);
          hasClicked = false; 
        }
      }, 500);
    }
  });
}

function tradegui() {
  const items = bot.inventory.items(); 
  const Nitem702 = items.find(item => item.type === 702);  
  const Nitem683 = items.find(item => item.type === 683);

  if (Nitem702) {
    chest.deposit(Nitem702.type, null, Nitem702.count);
  } 
  else if (Nitem683) {
    chest.deposit(Nitem683.type, null, 1);
  }
}

let latestMessage = '';
let previousMessage = '';
let lastestTrader = '';

bot.on('message', async (message) => {
  const messageString = message.toString();

  if (messageString.includes('[Trade] Giao dịch đã hoàn thành.')) {
    trading = false;
  }

  if (messageString.includes('[Trade] Giao dịch đã hủy.')) {
    trading = false;
  }
  
  if (messageString.includes('!')) {
    const usernameWithBracket = messageString.split('!')[0].trim();
    const secondBracketIndex = usernameWithBracket.indexOf(']', usernameWithBracket.indexOf(']') + 1);
    const firstSpaceIndexAfterBracket = usernameWithBracket.indexOf(' ', secondBracketIndex + 1);
    const infoAfterTrader = usernameWithBracket.substring(firstSpaceIndexAfterBracket).trim();
    const indexOfTraderMark = infoAfterTrader.indexOf("»");
    
    if (indexOfTraderMark !== -1 && indexOfTraderMark === infoAfterTrader.length - 1) {
      const trader = infoAfterTrader.substring(0, indexOfTraderMark).trim();
      lastestTrader = null;
      if (trader.includes("Taros")) {
        if (bot.food > 1) {
          bot.chat(`/trade ${trader}`);
          foodchecktools = false;
        } else {
          bot.chat(`/t ${trader} Đang đói!`);
          foodchecktools = true;
          lastestTrader = trader;
        }
      }
    }
  }

  if (messageString.includes('[Trade]') && messageString.includes('đang không ở gần!')) {
    const startKeyword = '[Trade] Người chơi';
    const endKeyword = 'đang không ở gần!';
    const start = messageString.indexOf(startKeyword) + startKeyword.length + 1;
    const end = messageString.indexOf(endKeyword) - 1;
    const traderfar = messageString.substring(start, end);
    bot.chat(`/t ${traderfar} Bạn ở quá xa!`)
  };

  if (messageString.includes("[Trade] Yêu cầu cho")) {
    checkChestStatus()  
  }

  if (messageString.includes('❤ Máu')) {
    autodrops();
    activateBotMovement();
    if (messageString !== previousMessage) {
      latestMessage = messageString;
      previousMessage = '';
      previousMessage = latestMessage; 
    }
  }

  if (messageString.includes(name) && messageString.indexOf(name) < messageString.indexOf('by')) {
    const userId = '935766223357087764'; 

    client.users.fetch(userId).then(user => {
      if (user) {
        user.send(`${messageString}`);
      }
    }).catch(console.error);
  }
});

setInterval(async () => {
  if (latestMessage !== '') {
    const channelId = '1203624167472103484'; 
    const messageId = '1203644113229053963'; 

    const channel = await client.channels.fetch(channelId);
    const fetchedMessage = await channel.messages.fetch(messageId);

    if (fetchedMessage) {
      const editedMessage = `\`\`\`\n${latestMessage}\n\`\`\``;
      await fetchedMessage.edit(editedMessage);
      latestMessage = ''; 
    }
  }
}, 5000);

client.login(process.env.DISCORD_BOT_TOKEN);
