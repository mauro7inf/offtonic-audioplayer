import ShepardGenerator from './ShepardGenerator.js';

class ShepardOctaveGenerator extends ShepardGenerator {
  constructor() {
    super();
    this.octaveParameter = null;
    this.a = null
    this.b = null;
    this.c = null;
  }

  update() {
    this.a = this.getProperty('octaveParameter');
    this.b = 10 - this.a;
    this.c = 10000000000/(Math.pow(this.a, this.a)*Math.pow(this.b, this.b));
    super.update();
  }

  getShepardFunction() {
    return (x => {
      return Math.pow(Math.pow(x, this.a)*Math.pow(1 - x, this.b)*this.c, 0.8);
    });
  }
}

ShepardOctaveGenerator.newProperties = {
  octaveParameter: {
    default: 4
  }
};
ShepardOctaveGenerator.setupProperties();

export default ShepardOctaveGenerator;