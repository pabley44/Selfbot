
const config = require('./config')

const math = require('mathjs')
const { Client } = require('discord.js-selfbot-v13')
const client = new Client({ checkUpdate: false })
const fs = require('fs');
//const fs = require('fs');
const ownerId = '1170085570874183773'; // apna developer id daal lena 
//const fetch = require('node-fetch');
const axios = require('axios');
const PREFIXx = '.';
const LTC_TO_USD_API = 'https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd';


client.on('ready', async () => {

  const Discord = require('discord.js-selfbot-v13')

  console.clear();

  console.log(`${client.user.tag} - rich presence started!`
  )
  bitly_axel = ""

  const r = new Discord.RichPresence()
    .setApplicationId('1213863394747097180')
    .setType('WATCHING') 
    .setURL('https://guns.lol/ssam')
    .setState('-')

    .setName('Buy now')
    .setDetails('Cheapest server boost')


    .setStartTimestamp(Date.now())
    .setAssetsLargeImage('https://cdn.discordapp.com/attachments/1208456759400726648/1213777991537000449/fe1790bf2ca43c4f27d8c2eda2473cd1.jpg?ex=65f6b5d8&is=65e440d8&hm=86f0ec6906fecaa4ee295b7191fb71b8a68932bc9b73c116d948332bad79791a&')
    .setAssetsLargeText('')
    
    .setAssetsSmallText('<- Buy Now')
        .addButton('Tools Shop', "https://ssmarkett.sellpass.io")
    .addButton('Discord Server ',"https://discord.gg/ssmarkett")

  client.user.setActivity(r);
  client.user.setPresence({ status: "dnd" });
  

})
let afkStatus = false;
let afkReasonn = "";

client.on('message', (message) => {
  if (afkStatus && message.mentions.users.has(client.user.id)) {
    const reply = `I am currently AFK and will reply later. Reason: ${afkReasonn}\n\n This message is fully automated and created by a Bot.`;
    message.reply(reply);
  }
});

function setAfkStatus(status, reason) {
  afkStatus = status;
  afkReasonn = reason;
}



client.on('message', (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('.afk') && message.author.id === ownerId) {
    const args = message.content.split(" ");
    const command = args.shift().toLowerCase();

    if (command === '.afk') {
      const status = args[0] === 'true';
      const reason = args.slice(1).join(" ");
      setAfkStatus(status, reason);

      if (status) {
        message.channel.send(`AFK status enabled. Reason: ${reason}`);
      } else {
        message.channel.send('AFK status disabled.');
      }
    }
  }
});



client.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('.v')) return;

  
  const userMessage = message.content.slice('.v'.length).trim();


  const repMessage = `+rep <@1170085570874183773> ${userMessage}`;
  message.edit(repMessage);
});



client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIXx) && message.author.id === ownerId) {
    const args = message.content.slice(PREFIXx.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'bal' || command === 'getbal') {
      const address = args[0];
      if (!address) {
        return message.reply('Please provide a valid Litecoin address.');
      }

      try {
        const [balanceResponse, exchangeRateResponse] = await Promise.all([
          axios.get(`https://api.blockcypher.com/v1/ltc/main/addrs/${address}/balance`),
          axios.get(LTC_TO_USD_API)
        ]);

        const confirmedBalanceLTC = balanceResponse.data.balance / 100000000;
        const unconfirmedBalanceLTC = balanceResponse.data.unconfirmed_balance / 100000000;

        const exchangeRateUSD = exchangeRateResponse.data.litecoin.usd;
        const confirmedBalanceUSD = confirmedBalanceLTC * exchangeRateUSD;
        const unconfirmedBalanceUSD = unconfirmedBalanceLTC * exchangeRateUSD;

        const messageContent = `**CONFIRMED BALANCE:** 
\`${confirmedBalanceUSD} $\`
\`${confirmedBalanceLTC} ltc\`
 **UNCONFIRMED BALANCE:**
 \`${unconfirmedBalanceUSD} $\`
\`${unconfirmedBalanceLTC} ltc\`
        `;

        message.channel.send(messageContent);
      } catch (error) {
        console.error(error);
        message.reply('An error occurred while fetching the balance. Please try again later.');
      }
    }
  }
});

client.on('message', async message => {
  if (message.author.id === ownerId && message.content.startsWith('.purge')) {
    const args = message.content.split(' ');
    const numMessagesToDelete = parseInt(args[1]);

    if (args.length === 2 && !isNaN(numMessagesToDelete)) {
      const channel = message.channel;

      try {
        const fetchedMessages = await channel.messages.fetch({ limit: numMessagesToDelete });
        const filteredMessages = fetchedMessages.filter(msg => msg.author.id === ownerId);

        filteredMessages.forEach(async msg => {
          await msg.delete();
        });

        message.channel.send(`Deleting ${filteredMessages.size} messages.`);
        
      } catch (error) {
        console.error('Failed to delete messages:', error);
      }
    }
  }
});

client.on('message', (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  
  if (message.author.id !== ownerId) {
    return console.log('You are not authorized to use this command!');
  }

  if (command === 'stocks') {
    viewStocks(message);
  } else if (command === 'addst') {
    addStock(message, args);
  } else if (command === 'sendst') {
    sendStock(message, args);
  } else if (command === 'removest') {
    removeStock(message, args);
  } else if (command === 'viewst') {
    viewSpecificStock(message, args);
  }
});

function viewStocks(message) {
  const stocks = readStocksFromFile();

  if (stocks.length === 0) {
    return message.channel.send('No stocks available.');
  }

  const stockList = stocks.map(stock => `${stock.name}: ${stock.items.length}x`).join('\n');
  message.channel.send(`Stocks:\n${stockList}`);
}

function addStock(message, args) {
  const stockName = args[0];
  const stockItems = args.slice(1);

  if (!stockName || stockItems.length === 0) {
    return message.channel.send('Invalid syntax! Use `.addst <stock name> <item1> <item2> ...`.');
  }

  const stocks = readStocksFromFile();
  const existingStock = stocks.find(stock => stock.name === stockName);

  if (existingStock) {
    existingStock.items.push(...stockItems);
  } else {
    stocks.push({ name: stockName, items: stockItems });
  }

  writeStocksToFile(stocks);
  message.channel.send(`Added ${stockItems.length}x ${stockName} successfully.`);
}

function sendStock(message, args) {
  const stockName = args[0];
  const stockAmount = parseInt(args[1]);

  if (!stockName || isNaN(stockAmount)) {
    return message.channel.send('Invalid syntax! Use `.sendst <stock name> <number of stock>`.');
  }

  const stocks = readStocksFromFile();
  const existingStock = stocks.find(stock => stock.name === stockName);

  if (!existingStock || existingStock.items.length < stockAmount) {
    return message.channel.send(`Insufficient stock of "${stockName}".`);
  }

  const sentItems = existingStock.items.splice(0, stockAmount);
  writeStocksToFile(stocks);

  const sentItemsList = sentItems.join('\n');
  message.channel.send(`Sent ${stockAmount} "${stockName}" successfully:\n${sentItemsList}`);
}

function removeStock(message, args) {
  const stockName = args[0];
  const stockAmount = parseInt(args[1]);

  if (!stockName || isNaN(stockAmount)) {
    return message.channel.send('Invalid syntax! Use `.removest <stock name> <number of stock>`.');
  }

  const stocks = readStocksFromFile();
  const existingStock = stocks.find(stock => stock.name === stockName);

  if (!existingStock || existingStock.items.length < stockAmount) {
    return message.channel.send(`Insufficient stock of "${stockName}".`);
  }

  existingStock.items.splice(0, stockAmount);
  writeStocksToFile(stocks);
  message.channel.send(`Removed ${stockAmount} "${stockName}" successfully.`);
}

function viewSpecificStock(message, args) {
  const stockName = args[0];

  if (!stockName) {
    return message.channel.send('Invalid syntax! Use `.viewst <stock name>`.');
  }

  const stocks = readStocksFromFile();
  const existingStock = stocks.find(stock => stock.name === stockName);

  if (!existingStock) {
    return message.channel.send(`Stock "${stockName}" not found.`);
  }

  const stockItems = existingStock.items.join('\n');
  message.channel.send(`${existingStock.name}:\n${stockItems}`);
}

function readStocksFromFile() {
  try {
    const data = fs.readFileSync('stocks.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeStocksToFile(stocks) {
  fs.writeFileSync('stocks.json', JSON.stringify(stocks, null, 2));
}



let categoryID;
let messages;
let isAutoClaiming = false;

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('channelCreate', channel => {
  if (isAutoClaiming && channel.parentId === categoryID) {
    const startTime = Date.now();
    setTimeout(() => {
      const timeElapsed = Date.now() - startTime; 
      channel.send(`${messages}`)
        
        .then(() => console.log(``))
        .catch(console.error);
    }, 0.1); 
  }
});

client.on('message', async message => {
  if (message.content.startsWith('.autoclaim start') && message.author.id === ownerId) {
    const args = message.content.split(' ').slice(2);
    categoryID = args[0];
    messages = args.slice(1).join(' ');
    isAutoClaiming = true;
    message.channel.send(`Auto-claiming has started for category ${categoryID} with message "${messages}".`);
  } else if (message.content === '.autoclaim stop' && message.author.id === ownerId) {
    isAutoClaiming = false;
    message.reply('Auto-claiming has been stopped.');
  }
});

const PREfFIX = '.';


client.on('message', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(`${PREfFIX}tr`) && message.author.id === ownerId) {
    const args = message.content.slice(PREfFIX.length).trim().split(/ +/);
    args.shift(); 
    const address = args[0];

    if (!address) {
      return message('Please provide a valid Litecoin address');
    }

    const addressUrl = `https://api.blockcypher.com/v1/ltc/main/addrs/${address}`;
    const priceUrl = 'https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=USD';

    try {
      const [addressResponse, priceResponse] = await Promise.all([
        axios.get(addressUrl),
        axios.get(priceUrl),
      ]);

      const addressData = addressResponse.data;
      const priceData = priceResponse.data;

      const receivedAmountLTC = parseFloat(addressData.total_received) / 1e8;
      const sentAmountLTC = parseFloat(addressData.total_sent) / 1e8;
      const price = priceData.USD;
      const receivedAmountUSD = receivedAmountLTC * price;
      const sentAmountUSD = sentAmountLTC * price;

      const responseMessage = `TOTAL SENT: ${sentAmountUSD.toFixed(2)} USD\nTOTAL RECEIVED: ${receivedAmountUSD.toFixed(
        2
      )} USD`;

      await message.reply(responseMessage);
    } catch (error) {
      console.error(error);
      await message.reply('Error occurred while fetching Litecoin address information');
    }
  }
});

client.on('message', (message) => {
  if (message.content === '.ls' && message.author.id === ownerId) {
    
    if (message.guild) {
    
      message.guild.leave()
        .then(() => console.log(`Left server: ${message.guild.name}`))
        .catch((error) => console.error('Error leaving server:', error));
    }
  }
});

const targetUserID = '291319309198950402';



const targetEmojis = new Map([
  ['Get the 🍒emoji now!', '🍒'],
  ['Get the 🧋 emoji now!', '🧋'],
  ['Get the 🎉 emoji now!', '🎉'],
  ['Get the 🍑 emoji now!', '🍑'],
  ['Get the 🍪 emoji now!', '🍪']
]);

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (newMessage.author && newMessage.author.id === targetUserID && newMessage.embeds.length > 0) {
    const embed = newMessage.embeds[0];
    const embedContent = embed.description || embed.title || '';
    const matchingEmojis = [];

    for (const [text, emoji] of targetEmojis) {
      const regex = new RegExp(text);
      if (regex.test(embedContent)) {
        matchingEmojis.push(newMessage.react(emoji));
      }
    }

    try {
      await Promise.all(matchingEmojis);
      console.log(`Reacted to message with multiple emojis: ${matchingEmojis.length}`);
    } catch (error) {
      console.error('Failed to react with emojis:', error);
    }
  }
});

client.on('message', (message) => {
  if (message.content === '.sid' && message.author.id === ownerId) {
    const serverId = message.guild.id;
    message.reply(`${serverId}`);
  }
});

client.on('message', async (message) => {
  if (message.content.startsWith(config.prefix)){

  const args = message.content.slice(config.prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'checktoken' && message.author.id === ownerId) {
    const token = args[0];
    await checkToken(message, token);
    message.delete();
  } 
  }
});

async function checkToken(message, token) {
  try {
    const temptok = new Client({ checkUpdate: false });
    await temptok.login(token);

    const { id, createdTimestamp } = temptok.user;
    const name = temptok.user.username;
    
    const createdDate = new Date(createdTimestamp);
    const formattedDate = createdDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const response = `Token name: ${name}\nTime when created: ${formattedDate}`;

    message.reply(response);

    temptok.destroy();
  } catch (error) {
    message.token('invalid token');
  }
}



const prefbix = '.setav ';


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefbix) || message.author.bot || message.author.id !== ownerId) return;

  const args = message.content.slice(prefbix.length).trim().split(' ');
  const photoLink = args[0];

  const user = message.author;

  user.setAvatar(photoLink)
    .then(() => {
      message.reply('Your avatar has been updated!');
    })
    .catch((error) => {
      console.error('Error updating avatar:', error);
      message.reply('An error occurred while updating your avatar.');
    });
});




const automessages = new Map();


client.on('message', (message) => {
  if (message.author.id !== ownerId) return;

  const args = message.content.split(' ');

  if (args[0] === '.automessage') {
    if (args.length < 4) {
      return message.reply('Invalid command! Please use the format: .automessage <channel id> <message> <time in seconds>');
    }

    const channelId = args[1];
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      return message.reply('Invalid channel ID! Please provide a valid channel ID.');
    }

    const content = args.slice(2, -1).join(' ');
    const timeInSeconds = parseInt(args[args.length - 1], 10);

    if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
      return message.reply('Invalid time value! Please provide a positive numeric value for the time in seconds.');
    }

    const intervalId = setInterval(() => {
      channel.send(content);
    }, timeInSeconds * 1000);

    automessages.set(channelId, intervalId); 

    channel.send(content);
    message.reply(`Automated messages set to be sent every ${timeInSeconds} seconds in channel ${channel}!`);
  }

  if (args[0] === '.listam') {
    const activeChannels = Array.from(automessages.keys());
    if (activeChannels.length === 0) {
      message.reply('No active automessages.');
    } else {
      message.reply('Active automessage channels:\n' + activeChannels.join('\n'));
    }
  }

  if (args[0] === '.stopam') {
    if (args[1] === 'all') {
      automessages.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      automessages.clear();
      message.reply('All automessages stopped.');
    } else {
      const channelId = args[1];
      const intervalId = automessages.get(channelId);
      if (intervalId) {
        clearInterval(intervalId);
        automessages.delete(channelId);
        message.reply(`Automessages stopped for channel ID ${channelId}.`);
      } else {
        message.reply('No active automessages found for the specified channel ID.');
      }
    }
  }
});



client.on('message', (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('.calc') && message.author.id === ownerId) {
    const equation = message.content.slice(6).trim();

    try {
      const answer = math.evaluate(equation);
     
      message.channel.send(`> **question** : ${equation}\n> **answer** : ${answer}`);
    } catch (error) {
      message.channel.send('Invalid equation.');
    }
  }

  if (message.content.startsWith('.spam') && message.author.id === ownerId) {
    const args = message.content.slice(5).trim().split(' ');
    const numTimes = parseInt(args[0]);
    const sayMessage = args.slice(1).join(' ');

    if (isNaN(numTimes)) {
      message.channel.send('Invalid number of times.');
      return;
    }

    for (let i = 0; i < numTimes; i++) {
      message.channel.send(sayMessage);
    }
  }
});






client.on('messageCreate', async message => {
  
  if (message.author.id !== ownerId || !message.content.startsWith(config.prefix)) {
    return;
  }

  
  const words = message.content.slice(config.prefix.length).trim().split(/\s+/);

  
  if (words[0] === 'clear') {
    
    const categoryId = words[1];
    const numChannels = parseInt(words[2]);

    
    const category = message.guild.channels.cache.find(c => c.type === 'GUILD_CATEGORY' && c.id === categoryId);

    if (!category) {
      return message.edit('Category not found!');
    }

    
    const channels = Array.from(category.children.values()).slice(0, numChannels);

  
    channels.forEach(async channel => {
      if (channel.deletable) {
        await channel.delete();
      }
    });

    
    message.edit(`${numChannels} channels from the top in the category "${category.name}" have been deleted!`);
  }
});



client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content === '.help' && message.author.id === ownerId) {
    const helpMessage = `
\`\`\`Commands\n\n\n.calc <equation>\n.spam <number> <message>
.bal <ltc address>\n.clear <category id> <number of channel>\n.price <coin name>\n.ar set <ar name> <ar value>\n.listar\n.ar remove <ar name>\n.gayrate <user>\n.automessage <channel id> <message> <time in seconds>\n.listam (gives all the channel where automessage are on)\n.stopam <channel id or all> ( stops automessage for that channel id or all the channels)\n.setav <photo link>\n.ls (it leaves the server)\n.sid (give server id)\n.checktoken <token>\n.tr <litecoin address>\n.autoclaim start <category id> <message>\n.autoclaim stop\n.purge <number>\n.afk true <reason>\n.afk false\n.v <vouch message>:\n\nMade by Sam\`\`\`
`;

    
    message.channel.send(helpMessage, { embed: null });
  }
});





client.on('message', async (message) => {
  if (message.author.bot) return;
  
  if (message.content.startsWith('.price') && message.author.id === ownerId) {
    const coinName = message.content.split(' ')[1];
    
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinName}&vs_currencies=usd`);
      const data = await response.json();
      
      if (data[coinName]) {
        const price = data[coinName].usd;
        message.channel.send(`${coinName} :  $${price}`);
      } else {
        message.channel.send(`Could not find information for ${coinName}`);
      }
    } catch (error) {
      console.error(error);
      message.channel.send('Error retrieving price information');
    }
  }
});

const dataFileg = 'autorespondersok.json';

let autoResponders = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  loadAutoResponders();
});

client.on('message', (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ar' && args[0] === 'set' && message.author.id === ownerId) {
    const arName = args[1];
    const arValue = args.slice(2).join(' ');
    setAutoResponder(arName, arValue);
    message.channel.send(`Auto responder '${arName}' set.`);
  } else if (command === 'listar' && message.author.id === ownerId) {
    const arList = Object.keys(autoResponders);
    message.channel.send(`Auto responders: ${arList.join(', ')}`);
  } else if (command === 'ar' && args[0] === 'remove' && message.author.id === ownerId) {
    const arName = args[1];
    removeAutoResponder(arName);
    message.channel.send(`Auto responder '${arName}' removed.`);
  } else {
    if(message.author.id !== ownerId) return;
    const arValue = getAutoResponder(command);
    if (arValue) {
      message.delete();
      message.channel.send(arValue);
    }
  }
});

function loadAutoResponders() {
  try {
    const data = fs.readFileSync(dataFileg, 'utf8');
    autoResponders = JSON.parse(data);
  } catch (err) {
    console.error(`Error loading auto responders: ${err}`);
  }
}

function saveAutoResponders() {
  try {
    const data = JSON.stringify(autoResponders);
    fs.writeFileSync(dataFileg, data, 'utf8');
  } catch (err) {
    console.error(`Error saving auto responders: ${err}`);
  }
}

function setAutoResponder(name, value) {
  autoResponders[name] = value;
  saveAutoResponders();
}

function getAutoResponder(name) {
  return autoResponders[name];
}

function removeAutoResponder(name) {
  delete autoResponders[name];
  saveAutoResponders();
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('.gayrate') && message.author.id === ownerId) {
    const mention = message.mentions.users.first();

    if (!mention) {
      message.channel.send('Please mention a user.');
      return;
    }

    const randomGayRate = Math.floor(Math.random() * 100) + 1;
    const response = `${mention} is ${randomGayRate}% gay.`;

    message.reply(response);

  }
});

client.login("MTE3MDA4NTU3MDg3NDE4Mzc3Mw.GNFaup.fYkMdZVK_RdyBKabXPc-HOYXjgDxJLRdFZmUxc");

const app = require('express')()

app.listen(80)

app.get('/', async (req, res) => {
  res.send('risk is online')
})

