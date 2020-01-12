const User = db.model("User");

async function callback(document) {
  if (!document) {
    return User.findOne({userId:this.author.id})
    .then(user => callback.call(this, user))
    .catch(err => error.call(this, err));
  }

  if (document.exp > document.nxtlvl) {
    return User.findOneAndUpdate({ userId:this.author.id },
                                 { $inc: {lvl:1, nxtlvl:(document.lvl * 100 * 1.3) } },
                                 { "upsert":true, "setDefaultOnInsert":true, "new":true }, ...bind(this));
  }

  let messages = [];

  switch(true) {
    case (document.lvl >= 100):
      if (!this.member.roles.has("403126466210037771")) {
        await this.member.addRole("403126466210037771");
        messages.push("You've ranked up to UberVIP! the highest possible rank");
      }
    case(document.lvl >= 60):
      if (!this.member.roles.has("403126385981521941")) {
        await this.member.addRole("403126385981521941");
        messages.push("You've ranked up to VIP");
      }
    case (document.lvl >= 30):
      if (!this.member.roles.has("403126248487780372")) {
        await this.member.addRole("403126248487780372");
        if (!this.author.bot) messages.push("You've ranked up to FAMOUS");
      }
    case (document.lvl >= 10):
      if (!this.member.roles.has("403126021500567552")) {
        await this.member.addRole("403126021500567552");
        if (!this.author.bot) messages.push("You've ranked up to WELL-KNOWN");
      }
    case (document.lvl >= 5):
      if (!this.member.roles.has("403125967939436545")) {
        await this.memeber.addRole("403125967939436545");
        if (!this.author.bot) messages.push("You've ranked up to NEWBIE");
      }
      break;
  }

  if (messages.length && !this.author.bot) {
    messages = messages
      .filter(messages => Boolean(message))
      .reverse()
      .map(message => this.author.send(message));
  }
}

function error(err) {
  console.error(err);
  this.guild.defaultChannel.send('${this.guild.owner} <@204316640735789056> There was a problem when assigning experience to a user.'
    + "This error has been logged to STDERR, and written to '~host/bot/err.txt'.");
}

function bind(message) {
  return [callback.bind(message), error.bind(message)];
}

module.exports = bind;
