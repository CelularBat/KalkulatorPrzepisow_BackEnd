const Logger = (() => {
    /* Settings: Logging levels:
         - DEBUG
         - INFO
         - WARN
         - ERROR
       Set the desired logging level here: */

    const LOGGING_LEVEL = "DEBUG";
  
    /* 
    Do not touch below 
    */

    const LEVELS = {
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4,
    };
    const currentLevel = LEVELS[LOGGING_LEVEL];
  
    function debug(...args) {
      if (currentLevel <= LEVELS.DEBUG) {
        const msg = `DEBUG: ${getCallerName()}:`;
        console.log(getCurrentTime(),msg, ...args);
      }
    }
  
    function info(...args) {
      if (currentLevel <= LEVELS.INFO) {
        const msg = `INFO: ${getCallerName()}:`;
        console.log(getCurrentTime(),msg, ...args);
      }
    }
  
    function warn(...args) {
      if (currentLevel <= LEVELS.WARN) {
        const msg = `WARN: ${getCallerName()}:`;
        console.warn(getCurrentTime(),msg, ...args);
      }
    }
  
    function error(...args) {
      if (currentLevel <= LEVELS.ERROR) {
        const msg = `ERROR: ${getCallerName()}:`;
        console.error(getCurrentTime(),msg, ...args);
      }
    }
  
    // Helper function to get the caller's name
    function getCallerName() {
      try {
        const err = new Error();
        const callerLine = err.stack.split("\n")[3];
        const callerName = callerLine.match(/at ([\w.]+)/)[1];
        return callerName || "Anonymous";
      } catch (e) {
        return "Unknown";
      }
    }

    function getCurrentTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0'); 
      const minutes = now.getMinutes().toString().padStart(2, '0'); 
      const seconds = now.getSeconds().toString().padStart(2, '0'); 
  
      return ( hours + ":" + minutes + ":" +  seconds + " " );
  }
  
    return { debug, info, warn, error };
  })();
  
  module.exports = Logger;
  