const logger = {
  info: (...args) => console.log('[Server Info]:', ...args),
  auth: (...args) => console.log('[Auth]:', ...args),
  error: (...args) => console.error('[Error]:', ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Debug]:', ...args);
    }
  }
};

module.exports = logger;
