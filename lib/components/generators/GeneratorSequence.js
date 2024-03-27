import Generator from './Generator.js';

class GeneratorSequence extends Generator {
  static newPropertyDescriptors = [
    {
      name: 'timer',
      isAudioParam: true,
      defaultValue: {ref: 'Default Timer'}
    },
    {
      name: 'pieces',
      defaultValue: [],
      setter: 'setPieces'
    },
    {
      name: 'componentCreationLeadTime',
      defaultValue: null
    }
  ];

  static processorName = "GeneratorSequenceProcessor";

  constructor() {
    super();
    this.componentCreationLeadTime = null;
    this.pieces = null;
    this.lastPieceTime = 0;
    this.pieceCounter = 0;
    this.currentGenerator = null;
    this.heldCallback = null;
  }

  setPieces(pieces) {
    this.pieces = {}; // is this right?
    pieces.forEach(piece => this.addPiece(piece, true));
  }

  addPiece(piece, recordTime) {
    this.pieces[this.pieceCounter] = piece;
    if (!('time' in piece)) {
      piece.time = this.lastPieceTime + piece.after;
    }
    if (recordTime) {
      this.lastPieceTime = piece.time;
    }
    if (this.node !== null) {
      this.registerTimedEvent(piece.time, this.pieceCounter, false);
    }
    this.pieceCounter++;
    if (this.getProperty('componentCreationLeadTime') !== null &&
        piece.generator !== null && typeof piece.generator === 'object' && !(piece.generator.isComponent || 'ref' in piece.generator)) {
      this.addPiece({
        time: piece.time - this.getProperty('componentCreationLeadTime'),
        create: this.pieceCounter - 1 // the event we just added
      }, false);
    }
  }

  handleTriggeredEvent(pieceIndex) {
    super.handleTriggeredEvent(pieceIndex);
    if (this.pieces !== null && pieceIndex in this.pieces) {
      this.executePiece(this.pieces[pieceIndex]);
    }
  }

  executePiece(piece) {
    if (!piece.isDone) {
      if ('generator' in piece && piece.generator !== null) {
        let generator = piece.generator;
        if (typeof generator === 'object' && (generator.isAudioComponent || 'ref' in generator)) {
          this.connectGenerator(generator);
        } else {
          generator = this.constructor.o.createComponent(generator, this.player, this.registry, this.tuning);
          this.connectGenerator(generator);
        }
      } else if ('create' in piece) {
        let pieceIndexToCreate = piece.create;
        this.pieces[pieceIndexToCreate].generator =
          this.constructor.o.createComponent(this.pieces[pieceIndexToCreate].generator, this.player, this.registry, this.tuning);
      }
      piece.isDone = true;
    }
  }

  createNode() {
    super.createNode();
    Object.keys(this.pieces).forEach((pieceIndex) => {
      this.registerTimedEvent(this.pieces[pieceIndex].time, pieceIndex, false);
    });
    if (this.currentGenerator !== null) {
      let currentGenerator = this.currentGenerator;
      this.currentGenerator = null;
      this.connectGenerator(currentGenerator);
    }
  }

  connectGenerator(generator) {
    if (this.currentGenerator !== null) {
      this.holdValue(() => {
        this.disconnectCurrentGenerator();
        this.performGeneratorConnection(generator);
      });
    } else {
      this.performGeneratorConnection(generator);
    }
  }

  performGeneratorConnection(generator) {
    this.connectComponentOrRefToAudioParamName(generator, 'generator', false);
    this.unholdValue();
    this.currentGenerator = generator;
  }

  disconnectCurrentGenerator() {
    this.disconnectComponentOrRefFromAudioParamName(this.currentGenerator, 'generator', false);
  }

  holdValue(heldCallback) {
    this.node.port.postMessage({
      hold: 'hold'
    });
    this.heldCallback = heldCallback;
  }

  receiveMessage(e) {
    super.receiveMessage(e);
    if ('held' in e.data && typeof this.heldCallback === 'function') {
      this.heldCallback();
      this.heldCallback = null;
    }
  }

  unholdValue() {
    this.node.port.postMessage({
      unhold: 'unhold'
    });
  }
}

export default GeneratorSequence;