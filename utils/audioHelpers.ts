export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getSupportedMimeType = (): string => {
  const types = [
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
    'audio/wav'
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return ''; // Fallback or empty if strictly needed
};

// --- Audio Compression Helpers ---

/**
 * Encodes an AudioBuffer to a WAV file Blob (16-bit PCM).
 */
const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF identifier
  writeString(0, 'RIFF');
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count (mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
};

/**
 * Compresses audio by downsampling to 16kHz Mono.
 * This significantly reduces file size for speech recognition.
 */
export const compressAudio = async (file: File): Promise<Blob> => {
  // Create an AudioContext to decode the file
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Target settings: 16kHz, Mono (1 channel)
    // Gemini works well with 16kHz for speech.
    const targetSampleRate = 16000;
    const targetChannels = 1;

    // Calculate new duration based on original duration (time doesn't change)
    const length = audioBuffer.duration * targetSampleRate;

    // Create an OfflineAudioContext to render the new audio
    const offlineContext = new OfflineAudioContext(
      targetChannels,
      length,
      targetSampleRate
    );

    // Create a buffer source for the original audio
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    // Render the audio
    const renderedBuffer = await offlineContext.startRendering();

    // Convert the rendered buffer to a WAV file
    const channelData = renderedBuffer.getChannelData(0);
    const wavBlob = encodeWAV(channelData, targetSampleRate);

    return wavBlob;
  } finally {
    await audioContext.close();
  }
};