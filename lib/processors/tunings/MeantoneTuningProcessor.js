class MeantoneTuningProcessor extends OfftonicAudioplayer.TuningProcessor {
  static newParameterDescriptors = [
    {
      name: 'octave'
    },
    {
      name: 'fifth'
    }
  ];

  static noteRegex = '^([ABCDEFGb#xdt]*)(-?[0-9]+)$';

  static nameMap = {
    'C': {octaves: 0, fifths: 0},
    'D': {octaves: -1, fifths: 2},
    'E': {octaves: -2, fifths: 4},
    'F': {octaves: 1, fifths: -1},
    'G': {octaves: 0, fifths: 1},
    'A': {octaves: -1, fifths: 3},
    'B': {octaves: -2, fifths: 5},
    'b': {octaves: 4, fifths: -7},
    '#': {octaves: -4, fifths: 7},
    'x': {octaves: -8, fifths: 14},
    'd': {octaves: 2, fifths: -3.5},
    't': {octaves: -2, fifths: 3.5}
  }

  static standardC4 = 440/Math.pow(2, 0.75); // Middle C

  constructor(options) {
    super(options);
  }

  parseNote(note, frame) {
    const match = note.match(this.constructor.noteRegex);
    const noteName = match[1];
    let octaves = +match[2] - 4; // measure octaves from Middle C
    let fifths = 0;

    for (let i = 0; i < noteName.length; i++) {
      let vector = this.constructor.nameMap[noteName[i]];
      octaves += vector.octaves;
      fifths += vector.fifths;
    }

    let cents = octaves*this.getParameter('octave', frame) + fifths*this.getParameter('fifth', frame);

    return this.constructor.standardC4 * Math.pow(2, cents/1200);
  }
}

OfftonicAudioplayer.registerProcessor('MeantoneTuningProcessor', MeantoneTuningProcessor);