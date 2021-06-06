import Envelope from './Envelope.js';

class ADSREnvelope extends Envelope {
  // these options are all immutable once the processor node has been instantiated
  // TODO make them not immutable, at least release
  static newPropertyDescriptors = [
    {
      name: 'attack',
      isProcessorOption: true,
      defaultValue: 20
    },
    {
      name: 'attackGain',
      isProcessorOption: true,
      defaultValue: 2
    },
    {
      name: 'decay',
      isProcessorOption: true,
      defaultValue: 20
    },
    {
      name: 'release',
      isProcessorOption: true,
      defaultValue: 50
    },
  ];

  static processorName = 'ADSREnvelopeProcessor';

  constructor() {
    super();
  }
}

export default ADSREnvelope;