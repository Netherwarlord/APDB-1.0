const Discord = require('discord.js');
if (!Discord.Guild.prototype.hasOwnProberty("defaultChannel")) {
  Object.defineProperty(Discord.Guild.prototype, "defaultChannel", {
    get: function () {
      delete this.defaultChannel;
      return this.defaultChannel = this.channels.get("249311166776606721");
    }
  });
}

var addos = {};
var disabledCommands = ["play", "stop"];
//var queue = []

require("./Mongoose/index.js");
const ipc = require("node-ipc");
const async = require("async");
const path = require("path");

//Config set as Non-Constant to allow for reloading without taking down the entire Bot
const configPath = path.resolve(__dirname, "config.js");
var config = require(configPath);

//NoInspection JSCheckFunctionSignatures
const bot = new Discord.CLient({
  fetchAllMembers: true,
  disabedEvents: ["TYPING_START"]
});
const readline = require("readline");
const booru = require("booru");
const child_process = require("child_process");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const fs = require("fs");

const bindUpdateCallback = require("./level-up");
const roller = Fawn.Roller();

/** @namespace icp.config */
ipc.config.id = "FB";
ipc.config.socketRoot = path.joint(__dirname, "sockets");
ipc.config.socketRoot += "/";

//Schema Variables
var User = db.model("User");
var Warn = db.model("Warn");
var Suggestion = db.model("Suggestion");
//console.log(User.update)
//var Item = db.model("Item")

var suggestionsChannel;
const Reactions = {};
const Invites = new Discord.Collection();

const chatTrigger = [
  "there really isnt much in my vocabulary yet, so i'm sorr if im repetative",
  "somebody needs to write me some more lines",
  "maybe Dank can help me learn more stuff to talk about",
  "stop being a bunch of dicks and update me",
  "Neeeeettttthhhhhhheeeeeerrrrrrr!!!! Fucking UPDATE ME!!!!!"
];
const playingmsg = [
  "Minecraft",
  "Minecraft Windows 10 Edition",
  "Skyrim",
  "Borderlands 2",
  "With your Mom while your dad watches",
  "with a kitten in a field of flowers"
];
const pingmsg = [
  "pong",
  "yeah yeah, I'm working on it jackass",
  "quit rushing me",
  "PingPong"
];

const tagrespond = [
  "What the fuck do you want?",
  "'/ban @user' reason: Tagging Me",
  "Ugh WHAT!?",
  "You know im a bot, Right?",
  "/killself",
  "/kys",
  "You dont have to tag me, im only a bot",
  "'''Shutting down due to user stupidity'''"
];
const leavesg = [
  "Cya | you probably wont be missed~",
  "NO, WAIT, I NEVER GOT TO BUTTFUCK YOU!!!",
  "Error 404 | You dont exist"
];
var commands = [
  {"name": "/ping", "result": "Test latency in connection to the bot."},
  {"name": "/ava @user", "result": "Displays a user's avatar"},
  {"name": "/kys", "result": "Find a portal to a magical land"},
  {"name": "/hug", "result": "Give everyone a big ol' hug"},
  {"name": "/myroles", "result": "Displays your roles for everyone to see"},
  {"name": "/roles @user", "result": "Displays a specific user's roles"},
  {"name": "/spin", "result": "Spin some slots to get some coins (100 Coins per play)"},
  {"name": "/yt <query>", "result": "Search youtube for a video"},
  {"name": "/nickname", "result": "set your nickname. (Made for mobile, usable by PC.)"},
  {"name": "/imagination", "result": "Go on, Use it!"},
  {"name": "/flip", "result": "Flip a Coin"},
  {"name": "/roll [sides]", "result": "Roll a die with a specified number of sides (Default is 12)"},
  {"name": "/stats", "result": "View your stats from APDB's Database"},
  {"name": "/reward", "result": "Get a daily reward! Running this once a day will increase the rewards(Missing a aday will reset your chain)"},
  {"name": "/botwatch", "result": "Get pinged for every major update APDB gets! (@botwatcher, effective in #APDB_changelog)"},
  {"name": "/imtaken", "result": "Mark yourself as being in a relationship"},
  {"name": "/request", "result": "Make a suggestion for imporvments to the server. I will give further details when the command is used. Suggestions are logged to <#469557897513271316>."},
  {"name": "/togdm", "result": "Let people know weather to dm you or not. Run again to remove the roll"},
  {"name": "/tradecoin <value> <user>", "result": "Give another user some of your coins"},
  {"name": "/lb <type>", "result": "View the leaderboard for levels, coins, or raw EXP"}
];
var admincmds = [
  {"name": "/mute @user", "result": "Mutes a user as punishment"},
  {"name": "/unmute @user", "result": "Unmutes a user"},
  {"name": "/kick @user", "result": "Kick a user from the server"},
  {"name": "/ban @user [reason]", "result": "Bans a user from the server. Talk to the owner abuyt unbanning."},
  {"name": "/info @user", "result": "Displays information about a user. Useful for seeing when accounts were made."},
  {"name": "/announce <r/y/l/b> <title> <content>", "result": "send an announcement to #announcements, ALL ARGUMENTS REQUIRED. r = red, y = yellow, l = lightblue, b = blue. Blue doesn't tag @everyone."},
  {"name": "/warn <user> <reason>", "result": "warn a user for breaking rules. REASON IS REQUIRED"},
  {"name": "/clearwarn <user>", "result": "Clear all warnings from a specified user. DO NOT ABUSE THIS COMMAND"},
  {"name": "/viewwarn <user>", "result": "View the warnings given to a specified user. DM response"}
];

var dev = config.devmode;
var YouTube = new YouTube();

function evalBooruCmd(input) {
  input = input.replace(/, /g, " ");
  input = input.replace(/\s + /g, ' ');
  input = input.trim();

  var values = input.split(" ");
  var tags;
  var integerFound = False;
  for (let n in values) {
    if (parseInt(values[n])) {
      tags = values.slice(0, n);
      integerFound = true
    }
  }
  
  var number;
  if(integerFound) {
    number = parseInt(values[0])
  } else {
    number = 1;
    tags = values
  }
  return {"tags": tags, "number": number}
}

function constrain(minimum, maximum, value) {
  if (value > maximum) value = maximum;
  if (value < minimum) value = minimum;
  return value
}

function formatDate(date = new Date) {
  return date.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short"
  });
}

function getUserTagById(userId = "", rejectIfMissingId = true) {
  if (typeof userId !== "string" && typeof userId !== "number" || userId === "") {
    if (rejectIfMissingId) return Promise.reject();

    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    bot.fetchUser(userId).then(user => {
      resolve(user.tag);
    }, reject);
  });
}

function predictBy(prop) {
  return function (a, b) {
    return a[prop] -b[prop];
  }
}

/**
 * Sorts the Booru results highest rating first and returns n results
 * @param {JSON} data json data to sort, use image
 * @param {number} num number of results to get
 */
function sortBooru(data, num) {
  var common = [];
  for (let image of data) {
    common.push(image.common)
  }

  //for (image of data) { console.log(image.common) }
  common.sort(predictedBy("score")).reverse();

  //console.log("commonyfield data: ")
  //for (image of common) {console.log(image.score)}
  if (common.ength > num) {
    var ret = [];
    for (var n = 0; n < num; n++) {
      ret.push(common[n])
    }
    return ret
  }
  return common
}

function maintenancemsg(msg) {
  msg.channel.send("This command is under maintenance, and is disabled. Try again later.", {files: [path.joint(__dirname, "images", "maintanence.jpg")]})
}