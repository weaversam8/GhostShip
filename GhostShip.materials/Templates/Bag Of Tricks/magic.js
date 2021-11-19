/**
 * This is the sidecar file that keeps track of in game objects.
 *
 * These functions are called from within Inform to keep track of state.
 */

class Thing {
  constructor(name, id, location, inInventory) {
    this.name = name;
    this.id = id;
    this.location = location;
    this.inInventory = inInventory;
  }
}

class Action {
  constructor(slug, id, name, args) {
    this.slug = slug;
    this.id = id;
    this.name = name;
    this.args = args;
  }

  setRulebook(type, rulebook) {
    switch (type) {
      case "check":
        this.checkRulebook = rulebook;
        break;
      case "carry out":
        this.carryOutRulebook = rulebook;
        break;
      case "report":
        this.reportRulebook = rulebook;
        break;
    }
  }

  triggerRulebook(rulebook, ...args) {
    if (MagicBag.getInstance().activeAction) {
      throw new Error(
        "Another action rulebook cannot be triggered while we're waiting for the response of a previous action rulebook."
      );
    }

    if (this.args !== args.length)
      throw new Error(
        `Invalid number of arguments for action ${this.slug}. ${this.args} expected, ${args.length} provided.`
      );
    const rulebookNum = rulebook.num;
    let commandSpecifier = `${rulebookNum}`;
    args.forEach((arg, i) => {
      commandSpecifier += `,${arg.id}`;
    });
    vorple.prompt.queueCommand(`trigger ${commandSpecifier}`, true);
    return new Promise((resolve, reject) => {
      MagicBag.getInstance().activeAction = {
        resolve,
        reject,
        commandSpecifier,
      };
    });
  }

  check(...args) {
    if (!this.checkRulebook)
      throw new Error("No check rulebook defined for action " + this.slug);

    MagicBag.getInstance().hideVorpleOutput = true;
    return this.triggerRulebook(this.checkRulebook, ...args);
  }

  carryOut(...args) {
    if (!this.carryOutRulebook)
      throw new Error("No carry out rulebook defined for action " + this.slug);

    return this.triggerRulebook(this.carryOutRulebook, ...args);
  }

  report(...args) {
    if (!this.reportRulebook)
      throw new Error("No report rulebook defined for action " + this.slug);

    return this.triggerRulebook(this.reportRulebook, ...args);
  }
}

class Rulebook {
  constructor(num, name, routine) {
    this.num = num;
    this.name = name;
    this.routine = routine;
  }
}
class MagicBag {
  static instance = null;

  static getInstance() {
    if (this.instance === null) {
      this.instance = new MagicBag();
    }
    return this.instance;
  }

  constructor() {
    this.things = {};
    this.rooms = {};
    this.actionsList = [];
    this.actionsMap = {};
    this.rulebooks = [];
    this.activeAction = null;
  }

  syncThing(thing) {
    if (thing.id in this.things) {
      this.things[thing.id].name = thing.name;
      this.things[thing.id].location = thing.location;
      this.things[thing.id].inInventory = thing.inInventory;
    } else {
      this.things[thing.id] = new Thing(
        thing.name,
        thing.id,
        thing.location,
        thing.inInventory
      );
    }
  }

  syncRoom(room) {
    if (room.id in this.rooms) {
      this.rooms[room.id].name = room.name;
    } else {
      this.rooms[room.id] = room;
    }
  }

  setActions(actions) {
    this.actionsList = actions.map((action) => {
      return new Action(action.slug, action.id, action.name, action.args);
    });
    this.actionsList.forEach((action) => {
      this.actionsMap[action.name.toLowerCase()] = action;
    });
  }

  setRulebooks(rulebooks) {
    this.rulebooks = rulebooks.map((rulebook) => {
      return new Rulebook(
        rulebook.num,
        rulebook.name,
        `B${rulebook.num}_` +
          rulebook.name.toLowerCase().replace(/\s/g, "_").substring(0, 23)
      );
    });

    this.assignRulebooksToActions();
  }

  assignRulebooksToActions() {
    this.rulebooks.forEach((rulebook) => {
      let matches = rulebook.name.match(
        /^(check|carry out|report)\s(.*)\s(rulebook)$/i
      );
      if (matches) {
        let actionName = matches[2].toLowerCase();
        if (actionName in this.actionsMap) {
          let action = this.actionsMap[actionName];
          action.setRulebook(matches[1], rulebook);
        }
      }
    });
  }

  // This function runs every time Inform prints text and allows us to potentially filter that output.
  outputFilter(output, meta) {
    const magic = MagicBag.getInstance();

    // if there's an active action, we want to see if we have a return type

    if (magic.activeAction) {
      const regex = new RegExp(
        "RB" + magic.activeAction.commandSpecifier + ":(\\d+)"
      );
      let matches = output.match(regex);
      if (matches) {
        const retValue = matches[1];
        if (retValue === "0") {
          magic.activeAction.resolve(true);
        } else {
          magic.activeAction.reject(retValue);
        }
        magic.activeAction = null;
        output = output.replace(regex, "");
      }
    }

    if (magic.hideVorpleOutput) {
      return "";
    } else return output;
  }

  // This function runs every time a "turn" is over and Inform is once again prompting the user for input.
  expectCommand() {
    const magic = MagicBag.getInstance();
    magic.hideVorpleOutput = false;
    console.log(magic);
  }
}
