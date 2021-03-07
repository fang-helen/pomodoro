let workSecs;
let restSecs;
let totalIntervals;

// status
let currentIntervals;
let currentSecs;
let resting;
let paused;
let running;

let curMeme;

// interval handler
let timer = false;

window.onload = function() {
  chrome.runtime.sendMessage({greeting: "status"}, function(response) {
    let results = response.farewell;

    // load status, configuration from background page
    currentSecs = Number(results[0]);
    currentIntervals = Number(results[1]);
    setResting(results[2]);
    paused = results[3];
    running = results[4];
    workSecs = results[5];
    restSecs = results[6];
    totalIntervals = results[7];
    curMeme = results[8];

    document.getElementById('x').value = Math.round((workSecs / 60) * 100) / 100;
    document.getElementById('y').value = Math.round((restSecs / 60) * 100) / 100;
    document.getElementById('z').value = totalIntervals;

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
    document.getElementById("settings-button").onclick = function() {
      toggleSettings();
    }
    document.getElementById("save-settings").onclick = function() {
      updateSettings();
      toggleSettings();
    }
    document.getElementById('meme').src = curMeme;

    // activate saved state
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
        // transition to non-rest
        setResting(false);
        currentSecs = workSecs - 1;
      } else {
        // transition to rest
        setResting(true);
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
function startTimer() {
  running = true;
  paused = false;
  chrome.runtime.sendMessage({greeting: "start"}, function(response) {});

  timer = window.setInterval(tick, 1000);
  document.getElementById("main").classList.add('running');
  document.getElementById('time-left').innerText = 'Interval ' + currentIntervals + ' out of ' + totalIntervals;
  document.getElementById('time-left').classList.remove('hide');

  document.getElementById("start-button").classList.add('hidden');
  document.getElementById("pause-button").classList.remove('hidden');
}

function resumeTimer() {
  running = true;
  paused = false;
  chrome.runtime.sendMessage({greeting: "start"}, function(response) {});
  timer = window.setInterval(tick, 1000);
  document.getElementById("main").classList.add('running');

  document.getElementById("resume-button").classList.add('hidden');
  document.getElementById("pause-button").classList.remove('hidden');
}

function pauseTimer() {
  paused = true;
  running = false;
  chrome.runtime.sendMessage({greeting: "pause"}, function(response) {});

  window.clearInterval(timer);
  document.getElementById("main").classList.remove('running');

  document.getElementById("pause-button").classList.add('hidden');
  document.getElementById("resume-button").classList.remove('hidden');
}

function stopTimer() {
  paused = false;
  running = false;
  chrome.runtime.sendMessage({greeting: "stop"}, function(response) {});

  window.clearInterval(timer);
  document.getElementById("main").classList.remove('running');
  document.getElementById('time-left').classList.add('hide');

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
  setResting(false);
  currentSecs = workSecs;
}

function setResting(setVal) {
  resting = setVal;
  if(resting) {
    // display meme
    document.getElementById('time').classList.add('resting');
    document.getElementById('meme').classList.add('resting');
  } else {
    // hide meme load next meme to use
    chrome.runtime.sendMessage({greeting: "meme"}, function(response) {
      curMeme = response.farewell;
      document.getElementById('meme').src = curMeme;
      document.getElementById('time').classList.remove('resting');
      document.getElementById('meme').classList.remove('resting');
    });
  }
}

let visible = false;
function toggleSettings() {
  if(visible) {
    visible = false;
    document.getElementById('settings-options').classList.add('hide-settings');
  } else {
    visible = true;
    document.getElementById('settings-options').classList.remove('hide-settings');
  }
}

function updateSettings() {
  // new work duration
  let newSecs = document.getElementById('x').value;
  if(!isNaN(newSecs)) {
    newSecs = Math.floor(Number(newSecs) * 60); // convert to seconds
  } else {
    newSecs = 25 * 60;                          // default value is 25 mins
  }

  // new rest duration
  let newRest = document.getElementById('y').value;
  if(!isNaN(newRest)) {
    newRest = Math.floor(Number(newRest) * 60); // convert to seconds
  } else {
    newRest = 25 * 60;                          // default value is 5 mins
  }

  // new interval count
  let newIntervals = document.getElementById('z').value;
  if(!isNaN(newIntervals)) {
    newIntervals = Math.ceil(Number(newIntervals));
    if(newIntervals < 1) {
      newIntervals = 1;
    }
  } else {
    newIntervals = 5;                    // default value is 5 intervals
  }

  workSecs = newSecs;
  restSecs = newRest;
  totalIntervals = newIntervals;
  document.getElementById('time-left').innerText = 'Interval ' + currentIntervals + ' out of ' + totalIntervals;

  console.log(workSecs);
  console.log(restSecs);
  console.log(totalIntervals);
  console.log('done from updateSettings');

  // update the background
  chrome.runtime.sendMessage(
    {greeting: "update " + newSecs + " " + newRest + " " + newIntervals}, 
    function(response) {
      console.log('resposne: ');
      console.log(response.farewell);
    }
  );

  if(!running && !paused) {
    currentSecs = workSecs;
    var mins = Math.floor (currentSecs / 60);
    var seconds = currentSecs % 60;
    if(seconds < 10) {
      seconds = '0' + seconds;
    }
    document.getElementById('time').innerText = mins + ':' + seconds;
  }
  
}
