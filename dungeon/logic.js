// logic.js - Full shared game logic for Emoji Dungeon Frameset
// ============================================================

// ===== GLOBAL STATE (shared via each iframe loading this file) =====
window.gameState = window.gameState || {
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
    horror:{ player: "🧟", wall: "🪦", floor: "⬜", exit: "🕳️", enemy: "🕷️", chest: "🪙", trap: "🪤", npc: "🧛", fireball: "🧨", arrow: "🪓" }
  },
  log: []
};

const ROOM_W = 20, ROOM_H = 10;
const dirs = { north:[0,-1], south:[0,1], west:[-1,0], east:[1,0] };

// ===== UTILS =====
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function log(msg){ window.gameState.log.push(msg); }

// ===== ROOM GENERATION =====
function createRoom(key){
  if(window.gameState.rooms[key]) return;
  const layout=[];
  for(let y=0;y<ROOM_H;y++){
    layout[y]=[];
    for(let x=0;x<ROOM_W;x++) layout[y][x]=(x===0||y===0||x===ROOM_W-1||y===ROOM_H-1)?"wall":"floor";
  }
  window.gameState.rooms[key]={layout};
}

// create starting room
createRoom("0,0");

// ===== BROADCAST TO FRAMES =====
function broadcast(){
  const mapWin=parent.frames["mapFrame"]?.window;
  const statusWin=parent.frames["statusFrame"]?.window;
  const infoWin=parent.frames["infoFrame"]?.window;
  mapWin?.updateMap?.(window.gameState);
  statusWin?.updateStatus?.(window.gameState);
  infoWin?.updateInfo?.(window.gameState);
}

// ===== FRAME-SPECIFIC SETUP =====
if(document.getElementById("map")){
  // We are in map.html
  window.updateMap=function(state){
    const t=state.themes[state.theme];
    const room=state.rooms[state.player.room];
    let out="";
    for(let y=0;y<ROOM_H;y++){
      for(let x=0;x<ROOM_W;x++){
        out+= (state.player.x===x&&state.player.y===y)?t.player : t[room.layout[y][x]];
      }
      out+="\n";
    }
    out+=`HP:${state.player.hp}/${state.player.maxHp} LVL:${state.player.level} EXP:${state.player.exp}`;
    document.getElementById("map").textContent=out;
  };
}

if(document.getElementById("status")){
  // status.html
  window.updateStatus=function(state){
    document.getElementById("status").textContent=state.log.slice(-10).join("\n");
  };
}

if(document.getElementById("inventory")){
  // inventory.html
  window.updateInfo=function(state){
    const equip=`Melee: ${state.player.weapon}\nRanged: ${state.player.ranged}\nArmor: ${state.player.armor}`;
    const inv=state.player.inventory.filter(i=>!i.startsWith("spell:")&&![state.player.weapon,state.player.ranged,state.player.armor].includes(i)).join("\n");
    const spells=state.player.spells.join("\n");
    document.getElementById("equipment").textContent=equip;
    document.getElementById("inventory").textContent=inv;
    document.getElementById("spells").textContent=spells;
  };
}

// ===== COMMAND HANDLER (command.html frame binds) =====
function handleCommand(cmd){
  log(`> ${cmd}`);
  if(cmd.startsWith("equip ")){
    const item=cmd.split(" ")[1];
    if(window.gameState.player.inventory.includes(item)){
      if(["bow","crossbow"].some(w=>item.includes(w))) window.gameState.player.ranged=item;
      else if(item.includes("armor")) window.gameState.player.armor=item;
      else window.gameState.player.weapon=item;
      log(`Equipped ${item}`);
    }else log(`You don't have ${item}`);
  }else if(cmd.startsWith("cast ")){
    log("Spell casting not yet implemented.");
  }else if(cmd.startsWith("fire ")){
    log(`You fire your ${window.gameState.player.ranged}`);
  }else if(cmd==="save"){
    localStorage.setItem("dungeonSave",JSON.stringify(window.gameState));
    log("Game saved.");
  }else if(cmd==="load"){
    const s=localStorage.getItem("dungeonSave");
    if(s){window.gameState=JSON.parse(s);log("Game loaded.");}
  }else log("Unknown command");
  broadcast();
}

// Bind input if command box exists
if(document.getElementById("command")){
  document.getElementById("command").addEventListener("keydown",e=>{if(e.key==="Enter"){handleCommand(e.target.value);e.target.value="";}});
}

// initial broadcast
broadcast();
