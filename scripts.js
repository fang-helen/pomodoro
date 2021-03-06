const runningColor = '#2a9d8f';
const staticColor = '#264653';

let workSecs;
let restSecs;
let totalIntervals;

// status
let currentIntervals;
let currentSecs;
let resting;
let paused;
let running;

// interval handler
let timer = false;

window.onload = function() {
  chrome.runtime.sendMessage({greeting: "status"}, function(response) {
    let results = response.farewell;

    // load status, configuration from background page
    currentSecs = Number(results[0]);
    currentIntervals = Number(results[1]);
    resting = results[2];
    paused = results[3];
    running = results[4];
    workSecs = results[5];
    restSecs = results[6];
    totalIntervals = results[7];

    // display the time
    var mins = Math.floor (currentSecs / 60);
    var seconds = currentSecs % 60;
    if(seconds < 10) {
      seconds = '0' + seconds;
    }
    document.getElementById('time').innerText = mins + ':' + seconds;

    // load event handlers on buttons
    document.getElementById("start-button").onclick = function() {
      startTimer();
    };
    document.getElementById("pause-button").onclick = function() {
      pauseTimer();
    };
    document.getElementById("resume-button").onclick = function() {
      resumeTimer();
    };
    document.getElementById("stop-button").onclick = function() {
      stopTimer();
    };

    if(running) {
      startTimer();
    }
    if(paused) {
      document.getElementById("start-button").classList.add('hidden');
      document.getElementById("resume-button").classList.remove('hidden');
    }
  }
  );
}

// ticks the timer once
function tick() {
  currentSecs --;
  if (currentSecs < 0) {
    if(currentIntervals < totalIntervals) {
      if(resting) {
        // incremement intervals on rest
        currentIntervals += 1;
        document.getElementById('time-left').innerText = 'Interval ' + currentIntervals + ' out of ' + totalIntervals;
        document.getElementById('resting').style.color = runningColor;
        // transition to non-rest
        resting = false;
        currentSecs = workSecs - 1;
      } else {
        // transition to rest
        document.getElementById('resting').style.color = 'white';
        resting = true;
        currentSecs = restSecs - 1;
      }
    } else {
      // finished all intervals
      stopTimer();
    }
  }
  // display updated time
  var mins = Math.floor (currentSecs / 60);
  var seconds = currentSecs % 60;
  if(seconds < 10) {
    seconds = '0' + seconds;
  }
  document.getElementById('time').innerText = mins + ':' + seconds;
  
}
async function startTimer() {
  chrome.runtime.sendMessage({greeting: "start"}, function(response) {});

  timer = window.setInterval(tick, 1000);
  document.getElementById("App").classList.add('running');
  document.getElementById('time-left').innerText = 'Interval ' + currentIntervals + ' out of ' + totalIntervals;
  document.getElementById('time-left').classList.remove('hide');
  if(!resting) {
    document.getElementById('resting').style.color = runningColor;
  } else {
    document.getElementById('resting').style.color = 'white';
  }

  document.getElementById("start-button").classList.add('hidden');
  document.getElementById("pause-button").classList.remove('hidden');
}

async function resumeTimer() {
  chrome.runtime.sendMessage({greeting: "start"}, function(response) {});
  timer = window.setInterval(tick, 1000);
  document.getElementById("App").classList.add('running');
  if(!resting) {
    document.getElementById('resting').style.color = runningColor;
  }

  document.getElementById("resume-button").classList.add('hidden');
  document.getElementById("pause-button").classList.remove('hidden');
}

function pauseTimer() {
  chrome.runtime.sendMessage({greeting: "pause"}, function(response) {});

  window.clearInterval(timer);
  document.getElementById("App").classList.remove('running');
  if(!resting) {
    document.getElementById('resting').style.color = staticColor;
  }

  document.getElementById("pause-button").classList.add('hidden');
  document.getElementById("resume-button").classList.remove('hidden');
}

function stopTimer() {
  chrome.runtime.sendMessage({greeting: "stop"}, function(response) {});
  
  window.clearInterval(timer);
  document.getElementById("App").classList.remove('running');
  document.getElementById('time-left').classList.add('hide');
  document.getElementById('resting').style.color = staticColor;

  document.getElementById("start-button").classList.remove('hidden');
  document.getElementById("pause-button").classList.add('hidden');
  document.getElementById("resume-button").classList.add('hidden');

  var mins = Math.floor (workSecs / 60);
  var seconds = workSecs % 60;
  if(seconds < 10) {
    seconds = '0' + seconds;
  }
  document.getElementById('time').innerText = mins + ':' + seconds;

  // reset
  currentIntervals = 1;
  resting = false;
  currentSecs = workSecs;
}