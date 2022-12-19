
import { SynthPack } from "./pages";
import * as Tone from "tone";

export type MidiNoteSequence={
    data: (string | null)[],
    duration: number;
    // readonly length: number;
    // readonly numberOfChannels: number;
    // readonly sampleRate: number;
}

export const notes = ["C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3","F#3" ,"G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"]



export const notesMap = new Map<string, number>(notes.map((i, ix)=>{return[i,ix]}))
export const tempoWidth = {
    "1n": 16 * 4,
    "2n": 16 * 2,
    "4n": 16,
    "8n": 16/2,
    "16n": 16/4,
    "32n": 16/8
}


export const instruments = ["Synth", "AMSynth", "FMSynth", "DuoSynth", "MembraneSynth", "MonoSynth"]

export const INSTRUMENTMAP ={
    Synth: "Synth",
    AMSynth:"AMSynth",
    FMSynth: "FMSynth",
    DuoSynth: "DuoSynth",
    MembraneSynth: "MembraneSynth",
    // MetalSynth: "MetalSynth",
    // PluckSynth: "PluckSynth",
    MonoSynth: "MonoSynth"
}

export const TEMPOS= {
    WHOLE: "1n",
    HALF: "2n",
    QUARTER: "4n",
    EIGHTH: "8n",
    SIXTEENTH: "16n",
    THIRTYSECOND: "32n"
}

export interface Track<T>{
    data: AudioBuffer | MidiNoteSequence,
    originalData?: AudioBuffer,
    soundMaker: SynthPack | Tone.Player,
    tempo?: string,
    timesToLoop?: number,
    edits:{
        trimStart: number ,
        trimEnd: number ,
        offsetFromStart: number, 

    }
};