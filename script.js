let words = [];
let correctOrder = [];

let timer = 0;
let interval;
let gameActive = true;

const wordList = document.getElementById("wordList");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");
const gameBoard = document.getElementById("gameBoard");

const streakDisplay = document.getElementById("streak");
const bestDisplay = document.getElementById("bestTime");
const leaderboardEl = document.getElementById("leaderboard");

let streak = Number(localStorage.getItem("streak")) || 0;
let bestTime = Number(localStorage.getItem("bestTime")) || null;

streakDisplay.textContent = streak;
bestDisplay.textContent = bestTime || "-";

function loadLeaderboard(){

let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");

leaderboardEl.innerHTML="";

scores.forEach(score=>{

const li = document.createElement("li");
li.textContent = score + " seconds";
leaderboardEl.appendChild(li);

});

}

function saveScore(time){

let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");

scores.push(time);

scores.sort((a,b)=>a-b);

scores = scores.slice(0,10);

localStorage.setItem("leaderboard", JSON.stringify(scores));

loadLeaderboard();

}

async function loadWords(){

const res = await fetch("words.txt");
const text = await res.text();

words = text.split(/\r?\n/).filter(w=>w.length);

startGame();

}

function startGame(seed=null){

gameActive = true;

gameBoard.classList.remove("faded");

clearInterval(interval);

timer = 0;
timerDisplay.textContent = 0;

message.textContent="";

interval = setInterval(()=>{

timer++;
timerDisplay.textContent = timer;

},1000);

const difficulty = Number(document.getElementById("difficulty").value);

let shuffled = seededShuffle([...words], seed || Math.random());

let selected = shuffled.slice(0,difficulty);

correctOrder = [...selected].sort((a,b)=>a.localeCompare(b));

selected = seededShuffle(selected, Math.random());

render(selected);

}

function render(list){

wordList.innerHTML="";

list.forEach(word=>{

const li = document.createElement("li");

li.textContent = word;
li.className="word";

wordList.appendChild(li);

});

checkLive();

}

new Sortable(wordList,{

animation:200,

onMove:(evt)=>{

if(!gameActive) return false;

showInsertionLine(evt);

},

onEnd:()=>{

if(!gameActive) return;

clearInsertionLines();
checkLive();
checkWin();

}

});

function checkLive(){

const nodes=[...document.querySelectorAll(".word")];

nodes.forEach((node,i)=>{

node.classList.remove("correct");

if(node.textContent===correctOrder[i])
node.classList.add("correct");

});

}

function showInsertionLine(evt){

clearInsertionLines();

const target = evt.related;

if(!target) return;

target.classList.add("insertLine");

}

function clearInsertionLines(){

document.querySelectorAll(".insertLine")
.forEach(n=>n.classList.remove("insertLine"));

}

function checkWin(){

const nodes=[...document.querySelectorAll(".word")];

let current = nodes.map(n=>n.textContent);

if(JSON.stringify(current)===JSON.stringify(correctOrder)){

gameActive=false;

clearInterval(interval);

message.textContent="🎉 Perfect!";

streak++;
localStorage.setItem("streak",streak);
streakDisplay.textContent=streak;

if(!bestTime || timer<bestTime){

bestTime=timer;
localStorage.setItem("bestTime",bestTime);
bestDisplay.textContent=bestTime;

}

saveScore(timer);

animateWin(nodes);

gameBoard.classList.add("faded");

setTimeout(()=>{
alert("You won! Time: " + timer + " seconds");
},300);

}

}

function animateWin(nodes){

nodes.forEach((node,i)=>{

setTimeout(()=>{
node.classList.add("win");
}, i*120);

});

}

function seededShuffle(array,seed){

let rng = mulberry32(hash(seed));

for(let i=array.length-1;i>0;i--){

const j=Math.floor(rng()*(i+1));

[array[i],array[j]]=[array[j],array[i]];

}

return array;

}

function hash(str){

let h=0;

str=str.toString();

for(let i=0;i<str.length;i++)
h=Math.imul(31,h)+str.charCodeAt(i)|0;

return h;

}

function mulberry32(a){

return function(){

let t=a+=0x6D2B79F5;

t=Math.imul(t^t>>>15,t|1);

t^=t+Math.imul(t^t>>>7,t|61);

return ((t^t>>>14)>>>0)/4294967296;

}

}

document.getElementById("newGame").onclick=()=>startGame();

document.getElementById("daily").onclick=()=>{

const today=new Date().toISOString().slice(0,10);

startGame(today);

};

loadLeaderboard();
loadWords();
