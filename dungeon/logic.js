
(function(){
const root = (window.parent && window.parent!==window)?window.parent:window;
const gs = root.gameState || {
  ROOM_W:20, ROOM_H:10,
  theme:'fantasy',
  themes:{
    fantasy:{player:'🧙',wall:'🟫',floor:'⬛',exit:'🚪',enemy:'👹',chest:'🎁'},
    scifi:{player:'👨‍🚀',wall:'🧱',floor:'◼️',exit:'🛸',enemy:'🤖',chest:'📦'},
    horror:{player:'🧟',wall:'🪦',floor:'⬜',exit:'🕳️',enemy:'🕷️',chest:'🪙'}
  },
  player:{x:1,y:1,hp:20,maxHp:20,exp:0,level:1,room:'0,0',inventory:['bow','sword','armor','spell: ignis'],spells:['ignis'],weapon:'sword',ranged:'bow',armor:'armor'},
  rooms:{},
  log:[]
};
root.gameState=gs;
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
const directions={north:[0,-1],south:[0,1],west:[-1,0],east:[1,0]};

function createRoom(key){
 if(gs.rooms[key])return;
 const room={layout:[],enemies:[],chests:[],exits:{}};
 for(let y=0;y<gs.ROOM_H;y++){
  room.layout[y]=[];
  for(let x=0;x<gs.ROOM_W;x++){
    room.layout[y][x]=(x===0||y===0||x===gs.ROOM_W-1||y===gs.ROOM_H-1)?'wall':'floor';
  }
 }
 for(const dir in directions){
  if(Math.random()<0.5||key==='0,0'){
   const [dx,dy]=directions[dir];
   const [rx,ry]=key.split(',').map(Number);
   const cx=dx===0?Math.floor(gs.ROOM_W/2):(dx>0?gs.ROOM_W-1:0);
   const cy=dy===0?Math.floor(gs.ROOM_H/2):(dy>0?gs.ROOM_H-1:0);
   room.layout[cy][cx]='exit';
   room.exits[`${cx},${cy}`]=`${rx+dx},${ry+dy}`;
  }
 }
 // enemies
 for(let i=0;i<2;i++){
  const ex=rand(1,gs.ROOM_W-2),ey=rand(1,gs.ROOM_H-2);
  if(room.layout[ey][ex]==='floor') room.enemies.push({x:ex,y:ey,hp:10});
 }
 gs.rooms[key]=room;
}

function broadcast(){
 try{
  root.frames['mapFrame']?.updateMap(gs);
  root.frames['statusFrame']?.updateStatus(gs);
  root.frames['infoFrame']?.updateInfo(gs);
 }catch(e){}
}

root.handleCommand=function(cmd){
 gs.log.push('> '+cmd);
 const a=cmd.trim().toLowerCase().split(' ');
 if(a[0]==='equip'){
   const item=a[1];
   if(gs.player.inventory.includes(item)){
     if(item==='bow') gs.player.ranged=item;
     else if(item==='armor') gs.player.armor=item;
     else gs.player.weapon=item;
     gs.log.push('Equipped '+item);
   }else gs.log.push("You don't have "+item);
 }else gs.log.push('Unknown command');
 broadcast();
};
root.movePlayer=function(dx,dy){
 const room=gs.rooms[gs.player.room];
 const nx=gs.player.x+dx, ny=gs.player.y+dy;
 const tile=room.layout[ny]?.[nx];
 if(!tile) return;
 if(tile==='wall') return;
 if(tile==='exit'){
  const next=room.exits[`${nx},${ny}`];
  createRoom(next);
  gs.player.room=next;
  gs.player.x=1;gs.player.y=1;
  gs.log.push('Moved to new room.');
 }else{
   gs.player.x=nx;gs.player.y=ny;
 }
 broadcast();
};

if(!gs.rooms['0,0']) createRoom('0,0');
broadcast();

// arrow keys in parent
if(root===window){
 window.addEventListener('keydown',e=>{
  if(document.activeElement && document.activeElement.tagName==='INPUT') return;
  if(e.key==='ArrowUp') root.movePlayer(0,-1);
  if(e.key==='ArrowDown') root.movePlayer(0,1);
  if(e.key==='ArrowLeft') root.movePlayer(-1,0);
  if(e.key==='ArrowRight') root.movePlayer(1,0);
 });
}

})();
