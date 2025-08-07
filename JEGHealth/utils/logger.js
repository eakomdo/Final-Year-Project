const LOG_PREFIX = '[JEGHealth]';

const getTimestamp = () => new Date().toISOString();

const logger = {
  log: (...args) => {
    console.log(LOG_PREFIX, getTimestamp(), ...args);
  },
  warn: (...args) => {
    console.warn(LOG_PREFIX, getTimestamp(), ...args);
  },
  error: (...args) => {
    console.error(LOG_PREFIX, getTimestamp(), ...args);
  },
  info: (...args) => {
    console.info(LOG_PREFIX, getTimestamp(), ...args);
  },
};

export default logger;
