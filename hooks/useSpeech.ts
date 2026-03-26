'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechRecognition(language: string, onFinalSubmit: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const isSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullTranscriptRef = useRef('');

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  }, [isListening]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
            fullTranscriptRef.current += finalTranscript + ' ';
        }
        
        setTranscript(fullTranscriptRef.current + interimTranscript);

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            if (isListening) {
                stopListening();
            }
        }, 3000); // 3 seconds of silence = stop
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (fullTranscriptRef.current.trim()) {
            onFinalSubmit(fullTranscriptRef.current.trim());
        }
        fullTranscriptRef.current = '';
        setTranscript('');
      };
    }
  }, [onFinalSubmit, isListening, stopListening]);

  useEffect(() => {
      if (recognitionRef.current) {
          recognitionRef.current.lang = language;
      }
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        fullTranscriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
        
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            if (isListening) {
                stopListening();
            }
        }, 5000); // Initial timeout if they don't say anything
      } catch (e) {
        console.error(e);
      }
    }
  }, [isListening, stopListening]);

  return { isListening, isSupported, transcript, startListening, stopListening };
}

let currentSource: AudioBufferSourceNode | null = null;
let currentCtx: AudioContext | null = null;

export async function playAudioBase64(base64Data: string, onEnded: () => void) {
  stopAudio(); // Ensure previous is stopped

  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  currentCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    const audioBuffer = await currentCtx.decodeAudioData(bytes.buffer.slice(0));
    currentSource = currentCtx.createBufferSource();
    currentSource.buffer = audioBuffer;
  } catch (e) {
    // Fallback for raw PCM
    const buffer = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      float32Data[i] = buffer[i] / 32768.0;
    }
    const audioBuffer = currentCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);
    currentSource = currentCtx.createBufferSource();
    currentSource.buffer = audioBuffer;
  }

  currentSource.connect(currentCtx.destination);
  currentSource.onended = onEnded;
  currentSource.start();
}

export function stopAudio() {
  if (currentSource) {
    try { currentSource.stop(); } catch (e) {}
    currentSource.disconnect();
    currentSource = null;
  }
  if (currentCtx) {
    try { currentCtx.close(); } catch (e) {}
    currentCtx = null;
  }
}
