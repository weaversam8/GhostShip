// Game variables
var selectedItem;
var actionsTextArr;

// Rooms
const rooms = ["a Cabin", "an Engine room"];
let currRoom = rooms[0];

// For Magic Bag API
var magic = null;
let oneArgActions;
let zeroArgActions;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Background sprites
    this.load.image("wall", "assets/wall.png");
    this.load.image("carpet", "assets/carpet.png");
    // Foreground sprites
    this.load.image("bed_base", "assets/bed_base.png");
    this.load.image("bed_pillow", "assets/bed_pillow.png");
    this.load.image("bed_quilt", "assets/bed_quilt.png");
    this.load.image("bookshelf", "assets/bookshelf.png");
    this.load.image("bookshelf_books-row", "assets/bookshelf_books-row.png");
    this.load.image("desk_base", "assets/desk_base.png");
    this.load.image("desk_drawer", "assets/desk_drawer.png");
    this.load.image("character", "assets/character.png");
    this.load.image("door-steel", "assets/door-steel.png");
    this.load.image("door-steel_padlock", "assets/door-steel_padlock.png");
    this.load.image("porthole", "assets/porthole.png");
    this.load.image("lightSwitch", "assets/lightSwitch.png");
    this.load.image("table", "assets/table.png");
    this.load.image("table_papers", "assets/table_papers.png");
    this.load.image("wardrobe", "assets/wardrobe.png");
    this.load.image("wardrobe_leather-jacket", "assets/wardrobe_leather-jacket.png");

    // Instance of Magic Bag API
    magic = MagicBag.getInstance();
    magic.onChange = onChange;
    magic.waitForLoad().then(() => {
      console.log("MagicBag Interpreter has loaded");
      refreshInventory();
    });
  }

  create() {
    // Disable browser right click menu
    //this.input.mouse.disableContextMenu();

    for (let i = 0; i < magic.rooms.length; i++) {
      allRooms[i] = magic.rooms[i].name;
    }

    // Initial starting scene
    this.makeRoom1();

    customRightClick();

    // Magic stuff
    oneArgActions = magic.actionsList.filter((action) => action.args == 1);
    zeroArgActions = magic.actionsList.filter((action) => action.args == 0);

    actionsTextArr = new Array();
    actionsTextArr.push("look at");
    actionsTextArr.push("pick up");
    actionsTextArr.push("smell");
  }

  update() {
    var location = magic.currentRoom;

    if (currRoom != location) {
      console.log("Room is changing from ", currRoom, " to ", location);
      currRoom = location;
    }
  }

  makeRoom1() {
    // Background layer sprites
    var wallObj = this.add.sprite(1280 / 2, 185, "wall").setScale(1);
    var carpetObj = this.add.sprite(1280 / 2, 548, "carpet").setScale(1);
    
    // Foreground layer sprites
    var doorX = 120;
    var doorY = 215;
    var doorObj = this.add
      .sprite(doorX, doorY, "door-steel")
      .setScale(0.3)
      .setInteractive();
    var padlockObj = this.add
      .sprite(doorX + 40, doorY + 35, "door-steel_padlock")
      .setScale(0.3)
      .setInteractive();
    var portholeObj = this.add
      .sprite(400, 215, "porthole")
      .setScale(0.5)
      .setInteractive();
    var bedX = 1000
    var bedY = 550;
    var bedObj = this.add
      .sprite(bedX, bedY, "bed_base")
      .setScale(1)
      .setInteractive();
    var bedPillowObj = this.add
      .sprite(bedX + 140, bedY - 30, "bed_pillow")
      .setScale(1)
      .setInteractive();
    var bedQuiltObj = this.add
      .sprite(bedX - 70, bedY + 20, "bed_quilt")
      .setScale(1)
      .setInteractive();
    var tableX = 550;
    var tableY = 600;
    var tableObj = this.add
      .sprite(tableX, tableY, "table")
      .setScale(0.35)
      .setInteractive();
    var tablePapersObj = this.add
      .sprite(tableX, tableY - 20, "table_papers")
      .setScale(0.35)
      .setInteractive();
    var characterObj = this.add
      .sprite(250, 350, "character")
      .setScale(0.5)
      .setInteractive();
    var lightSwitchObj = this.add
      .sprite(270, 160, "lightSwitch")
      .setScale(0.3)
      .setInteractive();

    // Make objects clickable
    clickable(bedObj, "a bed");
    clickable(bedPillowObj, "a pillow");
    clickable(bedQuiltObj, "a quilt");
    clickable(doorObj, "a steel door");
    clickable(padlockObj, "a padlock");
    clickable(portholeObj, "a porthole window");
    clickable(tableObj, "a table");
    clickable(tablePapersObj, "a few paper");
    clickable(characterObj, "yourself");
    clickable(lightSwitchObj, "a light switch");
  }
}

export default GameScene;

/*
    Custom right-click menu
    Reference: https://itnext.io/how-to-create-a-custom-right-click-menu-with-javascript-9c368bb58724
*/
function customRightClick() {
  const contextMenu = document.getElementById("context-menu");
  const scope = document.querySelector("body");

  // Enable visibility of menu when user right-clicks
  scope.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const { clientX: mouseX, clientY: mouseY } = event;

    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;

    contextMenu.classList.add("visible");
  });

  // Close right-click menu when user clicks outside
  scope.addEventListener("click", (e) => {
    if (e.target.offsetParent != contextMenu) {
      contextMenu.classList.remove("visible");
    }
  });

  //rightClickMenuKeepInBounds();
}

function refreshInventory() {
  // Clear inventory
  document.getElementById("inventory").innerHTML = "";

  // Make buttons for each inventory item
  const thingIDs = Object.keys(magic.things);
  thingIDs.forEach((thingID) => {
    if (magic.things[thingID].inInventory) {
      makeButton(magic.things[thingID]);
    }
  });
}

function onChange() {
  refreshInventory();
}

function rightClickMenuKeepInBounds() {
  /*
        Prevent the right-click menu from displaying out of bounds
        Part 1: normalize the position of the context menu
    */
  const normalizePozition = (mouseX, mouseY) => {
    // ? compute what is the mouse position relative to the container element (scope)
    const { left: scopeOffsetX, top: scopeOffsetY } =
      scope.getBoundingClientRect();

    const scopeX = mouseX - scopeOffsetX;
    const scopeY = mouseY - scopeOffsetY;

    // ? check if the element will go out of bounds
    const outOfBoundsOnX = scopeX + contextMenu.clientWidth > scope.clientWidth;

    const outOfBoundsOnY =
      scopeY + contextMenu.clientHeight > scope.clientHeight;

    let normalizedX = mouseX;
    let normalizedY = mouseY;

    // ? normalzie on X
    if (outOfBoundsOnX) {
      normalizedX = scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
    }

    // ? normalize on Y
    if (outOfBoundsOnY) {
      normalizedY =
        scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
    }

    return { normalizedX, normalizedY };
  };

  /*
        Prevent the right-click menu from displaying out of bounds
        Part 2: Use the normalize values to position the context menu
    */
  scope.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const { offsetX: mouseX, offsetY: mouseY } = event;

    const { normalizedX, normalizedY } = normalizePozition(mouseX, mouseY);

    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    contextMenu.classList.remove("visible");

    setTimeout(() => {
      contextMenu.classList.add("visible");
    });
  });
}

/* Holds the previous selected button.
 * Needed for reverting the style of
 * the previous button when a new button is pressed.
 */
var previousButton;

// onclick event for pressing button
function selectItem(clickedItem) {
  // Update global variable
  selectedItem = clickedItem;
  // If there was a previous selected button, change it to normal.
  if (previousButton) {
    previousButton.className = "normalButton";
  }
  // Update class for styling
  document.getElementById(clickedItem + "button").className = "selectedButton";

  previousButton = document.getElementById(clickedItem + "button");
}

// Make button for a given action
function makeButton(thing) {
  // Create the button with attributes
  var button = document.createElement("button");
  button.innerHTML = thing.name;
  button.id = "thing_" + thing.id;
  button.className = "normalButton";

  button.onclick = function () {
    selectItem(text);
  };

  // Append button to page
  document.getElementById("inventory").appendChild(button);
}

var clickedObject;

// Add clickable visuals & functionality to an sprite object
function clickable(object, name) {
  // Add color tint to object on mouse hover event
  object.on("pointerover", function (pointer) {
    this.setTint(0xc4c4c4);
  });

  // Add color tint to object on mouse click down event
  object.on("pointerdown", function (pointer) {
    if (pointer.button == 0) {
      // Left-click event
      this.setTint(0xff0000);
      objectLeftClickEvent(pointer, name);
    } else if (pointer.button == 2) {
      // Right-click event
      objectRightClickEvent(name);
    }

    clickedObject = name;
  });

  // Add color tint to object on mouse click release event
  object.on("pointerup", function (pointer) {
    this.setTint(0xc4c4c4);
  });

  // Remove color tint on object after moving mouse away
  object.on("pointerout", function (pointer) {
    this.clearTint();
  });
}

function objectLeftClickEvent(pointer, name) {
  if (selectedItem != null) {
    // Output to game text scrollbox
    var output = "TEMP OUTPUT: " + "use " + selectedItem + " on " + name + "\n";
    document.getElementById("game-text").innerText += output;

    scrollTextBox();

    // De-select item
    document.getElementById(selectedItem + "button").className = "normalButton";
    selectedItem = null;
  }

  // If pointer is not in the right-click menu
  if (pointer.target.offsetParent != document.getElementById("context-menu")) {
    //TODO: implement
  }
}

function objectRightClickEvent(obj) {
  updateRightClickMenuValues(obj);
}

function updateRightClickMenuValues(obj) {
  // Remove old elements
  const rcMenu = document.getElementById("context-menu");
  rcMenu.textContent = "";

  // Add title
  var title = document.createElement("div");
  title.className = "title";
  title.innerHTML = obj;
  rcMenu.appendChild(title);

  // Update the array of actions for the clicked object
  generateActions(obj);

  // Make new elements for each action
  for (let i = 0; i < actionsTextArr.length; i++) {
    makeRightClickElement(actionsTextArr[i]);
  }
}

function generateActions(obj) {
  // Clear the old actions
  actionsTextArr = [];

  // Get the "thing" as a variable from the API
  let objThing = null;
  let thingIDs = Object.keys(magic.things);
  console.log("Things length is ", thingIDs.length);
  for (let i = 0; i < thingIDs.length; i++) {
    console.log("Comparing ", magic.things[thingIDs[i]].name, " with ", obj);
    if (magic.things[thingIDs[i]].name === obj) {
      objThing = magic.things[thingIDs[i]];
    }
  }

  // Error catching
  if (objThing === null) {
    console.log("Thing was NOT found!");
  } else {
    console.log("Thing was found: ", objThing.name);
  }

  // Loop through the total list of actions
  for (let i = 0; i < oneArgActions.length; i++) {
    let action = oneArgActions[i];
    action
      .check(objThing)
      .then(() => {
        // If the action is valid for the object
        console.log(action.name, " is a valid action for ", obj);
        actionsTextArr.push(action.name);
      })
      .catch(() => {
        // If the action is NOT valid for the object
        console.log(action.name, " is NOT a valid action for ", obj);
      });
  }

  // Wait 500 miliseconds for magic's promise to resolve
  setTimeout(function () {
    console.log("waiting");
  }, 500);
}

// Make new element in the right-click menu for a given action
function makeRightClickElement(text) {
  // Create the div with attributes
  var action = document.createElement("div");
  action.className = "item";
  action.innerHTML = text;

  action.onclick = function () {
    selectAction(text);
  };

  // Append button to page
  document.getElementById("context-menu").appendChild(action);
}

function selectAction(text) {
  // Output to game text scrollbox
  var output = "TEMP OUTPUT: " + text + " " + clickedObject + "\n";
  document.getElementById("game-text").innerText += output;

  scrollTextBox();
}

function scrollTextBox() {
  // Scroll content to the bottom automatically
  var gameTextbox = document.getElementById("game-text");
  gameTextbox.scrollTop = gameTextbox.scrollHeight;
}
