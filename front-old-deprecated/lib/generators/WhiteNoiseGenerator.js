import Generator from './Generator.js';

class WhiteNoiseGenerator extends Generator {
  constructor() {
    super();
  }

  update() {
    super.update();
    this.value = 2*Math.random() - 1;
  }
}

WhiteNoiseGenerator.setupProperties();

export default WhiteNoiseGenerator;