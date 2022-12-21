import type { NextPage } from 'next'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import {DDSP, NoteSequence, SPICE} from "@magenta/music";
import { encodeWAV } from '../utils'
import { TEMPOS, Track } from  "../typesandconsts"
import PianoRoll from '../components/pianoroll'
import { MidiNoteSequence } from '../typesandconsts'
import { isMidiSequence } from '../utils'
export const DEFAULT_SAMPLE_RATE = 44100;


import * as Tone from "tone"
import SynthPanel from '../components/panel'
import SamplePanel from '../components/samplepanel'
import TrackView from '../components/trackview';
import { Router, useRouter } from 'next/router';
import { booleanMaskAsync } from '@tensorflow/tfjs';
import uuid from 'react-uuid';
import { flushSync } from 'react-dom';
const useIsPlaying = ()=>{
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  return {
    isPlaying, setIsPlaying
  }
}

export const isPlayingContext = createContext<{isPlaying: boolean, setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>}>({} as ReturnType<typeof useIsPlaying>);



export type SynthPack = Tone.Synth | Tone.AMSynth | Tone.FMSynth  | Tone.MonoSynth  | Tone.MembraneSynth | Tone.PluckSynth | Tone.DuoSynth
// metal,poly, noise



export const stopTheWorld = (tracks: Track<AudioBuffer | SynthPack>[]) => {
  for (let track of tracks) {
    if (track.soundMaker instanceof Tone.Player) {
      (track.soundMaker as Tone.Player).stop();
    } else {
      if ((track.soundMaker as any).oscillator !== undefined) {
        (track.soundMaker as Tone.Synth).oscillator.stop();
      } else if ((track.soundMaker as any).voice1 !== undefined) {
        (track.soundMaker as Tone.DuoSynth).voice0.oscillator.stop();
        (track.soundMaker as Tone.DuoSynth).voice1.oscillator.stop();
      } else {
        // console.log(track.soundMaker.get());
        // console.log(track.soundMaker.numberOfInputs);
        // console.log(track.soundMaker.numberOfOutputs);
        // Volume -> Gain

      }
    }
  }

  // console.log("NOW IN PAUSE: ", Tone.Transport.now(), Tone.now());
  // for (let ev of scheduledEvents) {
  //     Tone.Transport.clear(ev);

  // };
  Tone.Transport.cancel(Tone.Time(0).toSeconds());
  Tone.Transport.stop();
  Tone.Transport.seconds = Tone.Time(0).toSeconds();
  // isPlayingUsed.setIsPlaying(false);
  return;
};

export const  MODEL_ENDPOINT = "https://storage.googleapis.com/magentadata/js/checkpoints/ddsp/";
export const copyFromBufToBuf = (sourceBuf: AudioBuffer, targetBuf: AudioBuffer) => {
  for (let channelI = 0; channelI < targetBuf.numberOfChannels; ++channelI) {
    const samples = sourceBuf.getChannelData(channelI);
    targetBuf.copyToChannel(samples, channelI);
  }
}
const Home: NextPage = () => {
  const [model, setModel] = useState< SPICE>();
  const [ddspModel, setDdspModel] = useState<DDSP>();
  const isPlayingUsed = useIsPlaying();


  const ddspModelRef = useRef<DDSP | null>(null);
  const selectedInstrumentRef = useRef<string|null>(null);
  
  const [tracks, setTracks] = useState<Track<MidiNoteSequence | AudioBuffer>[]>([]);
  // const [resultBuffer, setResultBuffer] = useState<string | null>();
  const [showPianoRoll, setShowPianoRoll] = useState<boolean>(false);
  
  const [bpm, setBpm] = useState<number>();
  const [selected, setSelected] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const [globalContext, setGlobalContext] = useState<AudioContext>();
  const [selectedInstrument, setSelectedInstrument] = useState<string>("trumpet");
  useEffect(()=>{
    if (bpm != undefined){
      Tone.Transport.bpm.value= bpm;
    }

  }, [bpm]);
  const router = useRouter();
  useEffect(()=>{
    ddspModelRef.current = ddspModel!
    // console.log("MODEL CHANGED")
  }, [ddspModel]);
  useEffect(()=>{
    selectedInstrumentRef.current = selectedInstrument;
    // console.log("Yo Yo",selectedInstrumentRef.current, selectedInstrument)
  }, [selectedInstrument])
  const handleNewModel = async (instrument: string)=>{
    // console.log("INSIDE HANDLE NEW MODEL", instrument, selectedInstrument)
    if (router.isReady && navigator != undefined){
      // console.log("SHOULD BE HERE")
      const {DDSP} = await import("@magenta/music");
      let newModel = new DDSP(MODEL_ENDPOINT+ instrument.toLowerCase());
      await newModel.initialize();
      flushSync(()=>{
        setDdspModel(newModel);
      })
    }
  }
  

  useEffect(()=>{
    // Tone.setContext(new AudioContext());
    selectedRef.current = selected;
  }, [selected])
  useEffect(()=>{
    setBpm(Tone.Transport.bpm.value)
     document.addEventListener("keydown", (e)=>{
      // console.log(e.key)
      if (e.key == "Del" || e.key == "Backspace" || e.key == "Delete"){
        // console.log("SELECTEC:",selectedRef.current)
        if (selectedRef.current != null){
          setTracks(prev=>prev.filter((i, ix)=>{
            return ix != selectedRef.current;
          }))
          setSelected(null)
        }
      }
     });

    (async ()=>{
      const {SPICE, DDSP} = await import("@magenta/music");
      const spice =  new SPICE("https://tfhub.dev/google/tfjs-model/spice/2/default/1");
      const ddsp = new DDSP(MODEL_ENDPOINT + "trumpet");
      await ddsp.initialize();
      console.log(ddsp)
      setDdspModel(ddsp);
      await spice.initialize() 
      setModel(spice);
      console.log(spice);
  })();
    if (tracks.length == 0) {

      // console.log(Tone.Transport.bpm.value);
      let notes: (string | null)[] = [...Array(16)].map(i => null);
      let toDeploy = ["G2", "C2", "D2", "E2"];
      let x=0;
      for (let i = 0; i < 16; i++) {
        notes[i] = toDeploy[x];
        if (x==3){
          x=0
        } else {
          x +=1;
        }
      }
      let seq: MidiNoteSequence = {
        data: notes,
        duration: Tone.Time(TEMPOS.EIGHTH).toSeconds() * 16
      };
      let synth = new Tone.DuoSynth().toDestination().sync();
      synth.voice1.oscillator.type = "square";
      synth.voice0.oscillator.type= "sawtooth25"
      
      synth.volume.value = -16;
      const trackToAdd: Track<MidiNoteSequence> = {
        trackKey: uuid(),
        data: seq,
        soundMaker: synth,
        tempo: TEMPOS.EIGHTH,
        timesToLoop: 4,
        edits: { offsetFromStart: 0, trimEnd: 0, trimStart: 0 }
      };
      let notes2: (string | null)[] = [...Array(16)].map(i => null);
      let toDeploy2 = ["G2", "C2", "D2", "E2"];
      let x2 = 0;
      for (let i = 0; i < 16; i++) {
        notes2[i] = toDeploy[x2];
        if (x2 == 3) {
          x2 = 0
        } else {
          x2 += 1;
        }
      };
      let synth2 = new Tone.MonoSynth().toDestination().sync();
      synth2.volume.value = -4;
      synth2.oscillator.type = 'sawtooth';
      synth2.portamento = 0.2;
      let seq2: MidiNoteSequence = {
        data: notes2,
        duration: Tone.Time(TEMPOS.WHOLE).toSeconds() * 16
      };

      const trackToAlsoAdd: Track<MidiNoteSequence> = {
        trackKey: uuid(),
        data: seq2,
        soundMaker: synth2, 
        tempo: TEMPOS.WHOLE,
        timesToLoop: 1,
        edits: { offsetFromStart: 0, trimEnd: 0, trimStart: 0 }
      };

      let x3 = 0;
      let notes3: (string | null)[] = [...Array(16)].map(i => null);

      for (let i = 0; i < 16; i++) {
        notes3[i] = toDeploy[x3];
        if (x3 == 3) {
          x3 = 0
        } else {
          x3 += 1;
        }
      }
      let seq3: MidiNoteSequence = {
        data: notes3,
        duration: Tone.Time(TEMPOS.EIGHTH).toSeconds() * 16
      };
      let synth3 = new Tone.FMSynth().toDestination().sync();
      synth3.oscillator.type="sine"
      synth3.volume.value = 0;
      const trackToAdd3: Track<MidiNoteSequence> = {
        trackKey: uuid(),
        data: seq3,
        soundMaker: synth3,
        tempo: TEMPOS.EIGHTH,
        timesToLoop: 4,
        edits: { offsetFromStart: 18  * 2 * 16, trimEnd: 0, trimStart: 0 }
      };
      let synth4 = new Tone.FMSynth().toDestination().sync();
      synth4.oscillator.type= "fatcustom"
      synth4.volume.value = -5;
      let notes4: (string | null)[] = [...Array(16)].map(i => null);


      x3 = 0;
      let toDeployHigher = ["G4", "E4", null, "C4"];
      for (let i = 0; i < 16; i++) {
        notes4[i] = toDeployHigher[x3];
        if (x3 == 3) {
          x3 = 0
        } else {
          x3 += 1;
        }
      } 
      let seq4 = {
        data:notes4,
        duration: Tone.Time(TEMPOS.HALF).toSeconds() * 16
      }

      const trackToAdd4: Track<MidiNoteSequence> = {
        trackKey: uuid(),
        data: seq4,
        soundMaker: synth4,
        tempo: TEMPOS.HALF,
        timesToLoop: 1,
        edits: {offsetFromStart: 18 * 2 * 16, trimEnd: 0, trimStart:0}
      };

      x3 = 0;
      let notes5: (string | null)[] = [...Array(16)].map(i => null);

      let toDeployAlternate= ["G4", "C4", "G4", "C4"]
      for (let i = 0; i < 16; i++) {
        notes5[i] = toDeployAlternate[x3];
        if (x3 == 3) {
          x3 = 0
        } else {
          x3 += 1;
        }
      } 

      const seq5 = {
        data: notes5,
        duration: Tone.Time(TEMPOS.SIXTEENTH).toSeconds() * 16
      };
      let synth5 = new Tone.Synth().toDestination().sync();
      synth5.volume.value = 1;
      synth5.oscillator.type = "amtriangle12";
      const trackToAdd5: Track<MidiNoteSequence> = {
        trackKey: uuid(),
        data: seq5,
        soundMaker: synth5,
        tempo: TEMPOS.SIXTEENTH,
        timesToLoop: 4,
        edits: {offsetFromStart: 18*3*16, trimEnd:0, trimStart:0}
      }

      setTracks(prev => {
        return [...prev, trackToAdd, trackToAlsoAdd, trackToAdd3, trackToAdd4, trackToAdd5];
      });
      setSelected(1);
    }
    
  }, [])

const addAudioElement = async (blob: Blob)=>{
  // console.log("*****")
  let buf = await blob.arrayBuffer();
  let audbuf =  await Tone.context.decodeAudioData(buf);
  // console.log("AUDIO BUFFER: ", audbuf);
  const player = new Tone.Player().toDestination();
  const originalAudBuf = await Tone.context.createBuffer(audbuf.numberOfChannels, audbuf.length, audbuf.sampleRate);
  copyFromBufToBuf(audbuf, originalAudBuf);
  setTracks(prev=>{
    let newAudioBufferTrack: Track<AudioBuffer> = {
      trackKey: uuid(),
      data: audbuf,
      originalData: originalAudBuf,
      hasBeenAltered: null,
      soundMaker: player,
      edits: {
        offsetFromStart: 0,
        trimEnd: 0,
        trimStart: 0,
      } 
    };
    (newAudioBufferTrack.soundMaker as Tone.Player).buffer = new Tone.ToneAudioBuffer(audbuf);
    return [...prev, newAudioBufferTrack]
  });
}

const net = async ()=>{
  console.log("INSIDE NET()", selectedInstrumentRef.current);
  if (!(tracks[selected!].data instanceof AudioBuffer)){
    // console.log('PLOW')
    return;
  } else {
    // console.log("got here")
  const features= await model?.getAudioFeatures(tracks[selected!].data as AudioBuffer);
  const out = await ddspModelRef.current?.synthesize(features);

  if (out == undefined){
    // console.log("BAILED");
    return;}
    if ("sampleRate" in tracks[selected!].data){
      // setTracks(prev=>{
      //   let buf = prev[selected!].data;
      //   let toneAudBuf = (prev[selected!].soundMaker as Tone.Player).buffer;
      //   prev[selected!].data = buf;
      //   (prev[selected!].soundMaker as Tone.Player).buffer =  toneAudBuf;
      //   return [...prev];
      // })



      const encoded = encodeWAV(out, (tracks[selected!].data as AudioBuffer).sampleRate);
      const newAudioBuffer = await Tone.context.decodeAudioData(encoded.buffer);
      setTracks(prev=>{
        prev[selected!].data = newAudioBuffer;
        let toneAudBuf = new Tone.ToneAudioBuffer(newAudioBuffer);
        (prev[selected!].soundMaker as Tone.Player).buffer = toneAudBuf ;
        (prev[selected!].hasBeenAltered) = selectedInstrumentRef.current;
        return [...prev]; 
      })
    }

    
}

}
const hanldeNewPianoRollTrack = ()=>{
  let newMidiTrack: MidiNoteSequence = {data: [...Array(16)].map(i=>null), duration: Tone.Time(TEMPOS.QUARTER).toSeconds()*16  } 
  let priorLength = tracks.length;
  let synth = new Tone.Synth().toDestination().sync();
  synth.volume.value = -15;
  setTracks(prev=>[...prev, {
    data: newMidiTrack,
    trackKey:uuid(),
    timesToLoop: 1 ,
    soundMaker: synth ,
    tempo: TEMPOS.QUARTER, edits:{
    trimEnd: 0,
    trimStart: 0,
    offsetFromStart: 0
  }}]);
  setSelected(priorLength);
  setShowPianoRoll(true);
  
}

useEffect(()=>{
  // console.log(selected)
  // console.log(tracks)
  // console.log(selected != null && isMidiSequence(tracks[selected]))
  if (selected !=null){
    if (isMidiSequence(tracks[selected])){
      setShowPianoRoll(true);
      // console.log("hi")
    } else {
      setShowPianoRoll(false);
    }
  }
}, [selected])
useEffect(()=>{
  // console.log(tracks)
},[tracks]);

// const isPlayingInit = useIsPlaying();


  const playAll = async () => {
    Tone.Transport.seconds = Tone.Time(0).toSeconds();
    if (isPlayingUsed.isPlaying) {
      stopTheWorld(tracks);
      isPlayingUsed.setIsPlaying(false);
      return;

    }



    let max = 0;
    for (let each of tracks) {
      let newMax = (each.data.duration * (each.timesToLoop != undefined ? each.timesToLoop : 1)) + (each.edits.offsetFromStart / 18 / 2) + (each.edits.trimEnd / 18 / 2);
      if (newMax > max) {
        max = newMax;
      }
    }


    // console.log("TIMES:\nTone.now():", Tone.now(), " \n Tone.Transport():", Tone.Transport.now());
    // console.log("Synced?", Tone.now() == Tone.Transport.now());
    for (let track of tracks) {
      if (track.data instanceof AudioBuffer) {
        let id = Tone.Transport.scheduleOnce((time) => {

          // console.log("HERE IN RECORDED:");
          let diff = Tone.Transport.now() - track.soundMaker.now();
          // console.log("DIFF: ", diff);
          // console.log("Time in callback: ", time);
          // console.log("Time of Tone.now()", Tone.now());
          // console.log("Time of Player.now()", track.soundMaker.now());
          // console.log("Time of Tone.Transport.now()", Tone.Transport.seconds);
          let start_time = diff == 0 ? time : time - diff;
          // console.log(Tone.Time(Tone.Time("4n").toSeconds() + Tone.Time((track.edits.offsetFromStart / 18 / 2)).toSeconds()).toSeconds());
          // console.log(track.edits.trimEnd);
          (track.soundMaker as Tone.Player).start(start_time + (track.edits.offsetFromStart / 18 / 2), 0).stop(start_time + (track.edits.offsetFromStart / 18 / 2) + (track.data.duration + track.edits.trimEnd / 18 / 2));
        }, 0);
        // setScheduledEvents(prev => [...prev, id])

      } else if (isMidiSequence(track)) {
        let id = Tone.Transport.scheduleOnce((time) => {
          // console.log("HERE IN SYNTH:");
          let diff = Tone.Transport.now() - track.soundMaker.now();
          // console.log("DIFF: ", diff);

          // console.log("Time of callback", time);
          // console.log("Tone of Synth.now()", track.soundMaker.now());
          // console.log("Time of Tone.now()", Tone.now());
          // console.log("Time of Tone.Transport.now()", Tone.Transport.seconds);
          let start_time = diff == 0 ? time : time - diff;

          let offset = Tone.Time(0).toSeconds();

          for (let bar = 0; bar < track.timesToLoop!; bar++) {

            for (let note of (track.data as MidiNoteSequence).data) {
              if (note != null) {
                // console.log("TIME WITH OFFSET",Tone.Time("4n").toSeconds() + track.edits.offsetFromStart / 18 * Tone.Time("4n").toSeconds());
                (track.soundMaker as SynthPack).triggerAttackRelease(note, Tone.Time(track.tempo!).toSeconds(), Tone.Time("4n").toSeconds() + track.edits.offsetFromStart /18 * Tone.Time("4n").toSeconds() + offset);
              }
              offset += Tone.Time(track.tempo).toSeconds();
            }
          }
        }, 0)
        // setScheduledEvents(prev => [...prev, id])
      }
    };
    Tone.Transport.scheduleOnce(() => {
      stopTheWorld(tracks);
      isPlayingUsed.setIsPlaying(false);
    }, 0 + Tone.Time(max).toSeconds() + Tone.Time("4n").toSeconds())
    // console.log("starting", Tone.context.state)
    await Tone.context.resume();
    Tone.start();
    // console.log("starting", Tone.context.state);
    isPlayingUsed.setIsPlaying(true);
    Tone.Transport.start();



  };
type SaveType={
  type: string,
  content: (string|null| Float32Array)[] | (string|null)[][] | Blob;

}
// const handleSaveFile = ()=>{
//   for (let track of tracks){
//     if (track.data instanceof AudioBuffer ){
//       let data=[]
//       for (let x=0; x< (track.data as AudioBuffer).numberOfChannels; x++){
//         data.push((track.data as AudioBuffer).getChannelData(x).);
//       };
//       let out: SaveType = {
//         type: "AudioBuffer",
//         content: data
//       }
//     }
//   }
//   const fileData = JSON.stringify(tracks);
//   const blob = new Blob([fileData], {type: "text/plain"});
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.download = "humtune.json";
//   link.href = url;
//   link.click();
// };

const handleNet =  async (i: string)=>{
  if (i != selectedInstrument){
    let {DDSP} = await import("@magenta/music")
    let newModel = new DDSP(MODEL_ENDPOINT + i);
    await newModel.initialize();
    flushSync(()=>{
      setDdspModel(newModel);
      setSelectedInstrument(i);
    });
  };

  await net();
}


return (
  <isPlayingContext.Provider value={isPlayingUsed}>

      <div className='w-screen h-screen fixed bg-black flex flex-col justify-start items-center pt-24 overflow-hidden'>
        <div className='absolute top-0 left-0 w-screen h-24 border-b border-gray-900 flex flex-row justify-between items-center'>
          <div className=' top-0 left-0 ml-8 h-24 flex flex-row items-center justify-center'>
            <button onClick={() => hanldeNewPianoRollTrack()} className='w-10 h-10 bg-gray-200 transition-all hover:bg-orange-500 mr-4 rounded-[100%] text-black text-3xl flex flex-col items-center justify-center'>+</button>
            <AudioRecorder onRecordingComplete={addAudioElement} />
            {/* {selected != null && tracks[selected].data instanceof AudioBuffer && tracks.length != 0 && <button onClick={net} className='mx-4 w-32 h-12 bg-orange-500 rounded-md text-white'>Apply</button>} */}

          </div>
          <div className=' h-24  flex flex-row items-center text-orange-500'>
          <button className='w-32 h-12 text-orange-500 rounded-md text-3xl' onClick={() => tracks.length > 0 && playAll()}>{!isPlayingUsed.isPlaying ? <span className='h-full'>{"\u25B6"}</span> : <span className='h-full'> &#9632;</span>}</button>
          </div>
          <div className='h-full flex items-center text-orange-500 px-4'>
            <button className=' text-3xl font-bold ' onClick={() => setBpm(prev => prev! > 0 ? prev! - 1 : prev)}>-</button><span className='text-white mx-4'>BPM: {bpm}</span><button className="text-3xl mx-2 font-orange-500 font-bold" onClick={() => setBpm(prev => prev! + 1)}>+</button>
          </div>

          {/* <div className='h-full  flex items-center p-8'>
            <button onClick={handleSaveFile} className='w-32 h-12 rounded-md bg-orange-500 hover:bg-purple-500 transition-all text-white cursor-pointer'>Save</button>
          </div> */}
        </div>
        
        <div className='w-screen h-full flex flex-row' onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>e.preventDefault()}>

            <div className={`transition-all ${selected == null ? "w-full" : "w-9/12 "} ${selected == null ? "h-full": tracks[selected!].data instanceof AudioBuffer ?"h-full" : "h-4/6"} overflow-y-auto`}>

            <TrackView playAll={playAll}setBpm={setBpm} selected={selected} setSelected={setSelected} setTracks={setTracks} bpm={bpm!}globalContext={globalContext!}tracks={tracks}></TrackView>
            </div>
            {selected!= null && <div className='w-3/12'>
              {tracks[selected].data instanceof AudioBuffer ? <SamplePanel tracks={tracks} setSelectedInstrument={setSelectedInstrument} selectedInstrument={selectedInstrument} handleNet={handleNet} selected={selected} setTracks={setTracks} /> :<SynthPanel bpm={bpm!}setTracks={setTracks} tracks={tracks} selected={selected}/>}
              </div>} 
            {showPianoRoll && isMidiSequence(tracks[selected!]) && !(tracks[selected!] instanceof AudioBuffer)  && <PianoRoll selected={selected} track={tracks[selected!]} showPianoRoll={showPianoRoll} setTracks={setTracks} setShowPianoRoll={setShowPianoRoll}/>}
        </div>

       
   

      </div>

  </isPlayingContext.Provider>
    )

}

export default Home
