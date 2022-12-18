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
const useIsPlaying = ()=>{
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  return {
    isPlaying, setIsPlaying
  }
}

export const isPlayingContext = createContext<{isPlaying: boolean, setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>}>({} as ReturnType<typeof useIsPlaying>);



export type SynthPack = Tone.Synth | Tone.AMSynth | Tone.FMSynth  | Tone.MonoSynth  | Tone.MembraneSynth | Tone.PluckSynth | Tone.DuoSynth
// metal,poly, noise

const Home: NextPage = () => {
  const [model, setModel] = useState< SPICE>();
  const [ddspModel, setDdspModel] = useState<DDSP>();
  
  const [tracks, setTracks] = useState<Track<MidiNoteSequence | AudioBuffer>[]>([]);
  // const [resultBuffer, setResultBuffer] = useState<string | null>();
  const [showPianoRoll, setShowPianoRoll] = useState<boolean>(false);
  
  const [bpm, setBpm] = useState<number>();
  const [selected, setSelected] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null)
  const [globalContext, setGlobalContext] = useState<AudioContext>();
  
  

  useEffect(()=>{
    // Tone.setContext(new AudioContext());
    selectedRef.current = selected;
  }, [selected])
  useEffect(()=>{
    setBpm(Tone.Transport.bpm.value)
     document.addEventListener("keydown", (e)=>{
      console.log(e.key)
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
      const ddsp = new DDSP("https://storage.googleapis.com/magentadata/js/checkpoints/ddsp/trumpet");
      await ddsp.initialize();
      console.log(ddsp)
      setDdspModel(ddsp);
      await spice.initialize() 
      setModel(spice);
      console.log(spice);
  })();
    
  }, [])
// https://storage.googleapis.com/magentadata/js/checkpoints/ddsp/trumpet/group1-shard1of1.bin
const [soundInput, setSoundInput] = useState<string | null>();

const addAudioElement = async (blob: Blob)=>{
  console.log("*****")
  let buf = await blob.arrayBuffer();
  let audbuf =  await Tone.context.decodeAudioData(buf);
  console.log("AUDIO BUFFER: ", audbuf);
  const player = new Tone.Player().toDestination().sync();
  setTracks(prev=>{
    let newAudioBufferTrack: Track<AudioBuffer> = {
      data: audbuf,
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
  if (!(tracks[selected!].data instanceof AudioBuffer)){
    console.log('PLOW')
    return;
  } else {
    console.log("got here")
  const features= await model?.getAudioFeatures(tracks[selected!].data as AudioBuffer);
  const out = await ddspModel?.synthesize(features);
// let out = "hi"
  if (out == undefined){
    console.log("BAILED");
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
        (prev[selected!].soundMaker as Tone.Player).buffer = toneAudBuf 
        return [...prev]; 
      })
    }

    
}

}
const hanldeNewPianoRollTrack = ()=>{
  let newMidiTrack: MidiNoteSequence = {data: [...Array(16)].map(i=>null), duration: 1 / (bpm! / 60 )* 16  } 
  let priorLength = tracks.length;
  let synth = new Tone.Synth().toDestination().sync();
  synth.volume.value = -15;
  setTracks(prev=>[...prev, {data: newMidiTrack,timesToLoop: 1 ,soundMaker: synth ,tempo: TEMPOS.QUARTER, edits:{
    trimEnd: 0,
    trimStart: 0,
    offsetFromStart: 0
  }}]);
  setSelected(priorLength);
  setShowPianoRoll(true);
  
}

useEffect(()=>{
  console.log(selected)
  console.log(tracks)
  console.log(selected != null && isMidiSequence(tracks[selected]))
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
  console.log(tracks)
},[tracks])

return (
  <isPlayingContext.Provider value={useIsPlaying()}>

      <div className='w-full h-screen bg-black flex flex-col items-center pt-24'>
        <div className='absolute top-0 left-0 ml-8 h-24 flex flex-row items-center justify-center'>
          <button onClick={()=>hanldeNewPianoRollTrack()} className='w-10 h-10 bg-white transition-all hover:bg-orange-500 mr-4 rounded-[100%] text-black text-3xl flex flex-col items-center justify-center'>+</button>
          <AudioRecorder onRecordingComplete={addAudioElement}/>
          { selected != null && tracks[selected].data instanceof AudioBuffer && tracks.length !=0 && <button onClick={net}className='mx-4 w-32 h-12 bg-orange-500 rounded-md text-white'>Apply</button>}
        </div>
        <div className='w-full h-full flex flex-row'>

            <div className={`transition-all ${selected == null ? "w-full h-full" : "w-9/12 h-4/6"} overflow-y-auto`}>

            <TrackView selected={selected} setSelected={setSelected} setTracks={setTracks} bpm={bpm!}globalContext={globalContext!}tracks={tracks}></TrackView>
            </div>
            {selected!= null && <div className='w-3/12'>
              {tracks[selected].data instanceof AudioBuffer ? <SamplePanel selected={selected} setTracks={setTracks} track={tracks[selected]}/> :<SynthPanel setTracks={setTracks} tracks={tracks} selected={selected}/>}
              </div>} 
            {showPianoRoll && isMidiSequence(tracks[selected!]) && !(tracks[selected!] instanceof AudioBuffer)  && <PianoRoll selected={selected} track={tracks[selected!]} showPianoRoll={showPianoRoll} setTracks={setTracks} setShowPianoRoll={setShowPianoRoll}/>}
        </div>

       
   

      </div>

  </isPlayingContext.Provider>
    )

}

export default Home
