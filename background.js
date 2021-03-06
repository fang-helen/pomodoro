const memesLocation = 'assets/images/'
const memes = [
  'ant.jpg',
  'bird.png',
  'dog.jpg',
  'dory.jpg',
  'duck.jpg',
  'goat.jpg',
  'hedgehog.jpg',
  'mouse.jpg',
  'otter.jpg',
  'seabass.jpg',
  'turtle.jpg'
];

var stop_audio = new Audio('assets/music-box.mp3');
var interval_audio = new Audio('assets/default.mp3');

let workSecs = 25 * 60;
let restSecs = 5 * 60;
let totalIntervals = 5;

// workSecs = 10;
// restSecs = 5;
// totalIntervals = 2;

var currentIntervals = 1;
var currentSecs = workSecs;
var resting = false;

// interval handler
var timer = false;

// status
var paused = false;
var running = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
             "from a content script:" + sender.tab.url :
             "from the extension");
    if (request.greeting == "status")
      sendResponse({farewell: [currentSecs, currentIntervals, resting, paused, running, workSecs, restSecs, totalIntervals]});
    else if (request.greeting == "start") {  
      startTimer();
      return true;
    }
    else if (request.greeting == "pause") {
      pauseTimer();
      return true;
    }
    else if (request.greeting == "stop") {
      stopTimer();
      return true;
    }

 });

 function tick() {
  currentSecs --;
  if (currentSecs < 0) {
    if(currentIntervals < totalIntervals) {
      if(resting) {
        currentIntervals += 1;
        resting = false;
        currentSecs = workSecs - 1;
      } else {
        resting = true;
        currentSecs = restSecs - 1;
      }
      interval_audio.play();
    } else {
      stop_audio.play();
      stopTimer();
    }
  }
  
}
async function startTimer() {
  timer = window.setInterval(tick, 1000);
  running = true;
  paused = false;
}

function pauseTimer() {
  window.clearInterval(timer);
  paused = true;
  running = false;
}

function stopTimer() {
  window.clearInterval(timer);
  running = false;
  paused = false;

  // reset
  currentIntervals = 1;
  resting = false;
  currentSecs = workSecs;
}

function getImage() {
  let meme = memes[Math.floor(Math.random() * memes.length)];
}