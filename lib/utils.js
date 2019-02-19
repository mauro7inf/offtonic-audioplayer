import config from './config.js';

const NAME_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

let utils = {};

utils.getClass = function (className) {
  return config.classes[className];
};

utils.registerClass = function (className, classItself) {
  config.classes[className] = classItself;
};

utils.listClasses = function () {
  console.log(Object.keys(config.classes));
};

utils.parseClass = function (options) {
  let result = undefined;
  if ('className' in options) {
    if (typeof options.className === 'string') {
      result = utils.getClass(options.className);
    } else {
      result = options.className;
    }
  }
  return result;
};

utils.buildComponent = function (options) {
  let result = undefined;
  let constructor = utils.parseClass(options);
  if (constructor !== undefined) {
    result = new constructor(options);
  }
  return result;
}

utils.createUniqueName = function (n) {
  let name = '';
  for (let i = 0; i < n; i++) {
    name += NAME_CHARACTERS.charAt(Math.floor(Math.random() * NAME_CHARACTERS.length));
  }
  return name;
}

export default utils;