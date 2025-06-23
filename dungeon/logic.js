// logic.js - Shared game logic for Emoji Dungeon Frameset

// Global game state (shared across frames)
window.gameState = {
  player: {
    x: 1, y: 1, hp: 20, maxHp: 20, exp: 0, level: 1, room: "0,0",
    inventory: ["bow", "sword", "armor", "spell: ignis"],
    spells: ["ignis"], weapon: "sword", ranged: "bow", armor: "armor"
  },
  rooms: {},
  theme: "fantasy",
  themes: {
    fantasy: { player: "🧙", wall: "🟫", floor: "⬛", exit: "🚪", enemy: "👹", chest: "🎁", trap: "🪤", npc: "🤝", fireball: "🔥", arrow: "🏹" },
    scifi: { player: "👨‍🚀", wall: "🧱", floor: "◼️", exit: "🛸", enemy: "🤖", chest: "📦", trap: "💣", npc: "🤖", fireball: "💥", arrow: "🔫" },
    horror: { player: "🧟", wall: "🪦", floor: "⬜", exit: "🕳️", enemy: "🕷️", chest: "🪙", trap: "🪤", npc: "🧛", fireball: "🧨", arrow: "🪓" }
  },
  log: [],
};

// Messaging function
function broadcastUpdate() {
  const mapWin = parent.frames["mapFrame"].window;
  const statusWin = parent.frames["statusFrame"].window;
  const infoWin = parent.frames["infoFrame"].window;

  if (mapWin?.updateMap) mapWin.updateMap(window.gameState);
  if (statusWin?.updateStatus) statusWin.updateStatus(window.gameState);
  if (infoWin?.updateInfo) infoWin.updateInfo(window.gameState);
}

// Command handler
function handleCommand(cmd) {
  window.gameState.log.push("> " + cmd);
  if (cmd.startsWith("equip ")) {
    const item = cmd.split(" ")[1];
    if (window.gameState.player.inventory.includes(item)) {
      if (item.includes("bow") || item.includes("gun")) window.gameState.player.ranged = item;
      else if (item.includes("armor")) window.gameState.player.armor = item;
      else window.gameState.player.weapon = item;
      window.gameState.log.push("Equipped " + item);
    } else {
      window.gameState.log.push("You don't have " + item);
    }
  } else if (cmd.startsWith("cast ")) {
    window.gameState.log.push("You cast a spell. (Effect not yet implemented)");
  } else if (cmd.startsWith("fire ")) {
    window.gameState.log.push("You fire your " + window.gameState.player.ranged);
  } else if (cmd === "talk") {
    window.gameState.log.push("You try to talk to nearby NPCs...");
  } else if (cmd === "examine") {
    window.gameState.log.push("You look around carefully.");
  } else {
    window.gameState.log.push("Unknown command: " + cmd);
  }
  broadcastUpdate();
}

// Bind input (for command frame)
if (document.getElementById("command")) {
  document.getElementById("command").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleCommand(e.target.value);
      e.target.value = "";
    }
  });
}

// Initial render (if any frame has update fn)
broadcastUpdate();

