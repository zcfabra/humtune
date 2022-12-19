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
        console.log(track.soundMaker.get());
        console.log(track.soundMaker.numberOfInputs);
        console.log(track.soundMaker.numberOfOutputs);
        // Volume -> Gain

      }
    }
  }

  console.log("NOW IN PAUSE: ", Tone.Transport.now(), Tone.now());
  // for (let ev of scheduledEvents) {
  //     Tone.Transport.clear(ev);

  // };
  Tone.Transport.cancel(Tone.Time(0).toSeconds());
  Tone.Transport.stop();
  Tone.Transport.seconds = Tone.Time(0).toSeconds();
  // isPlayingUsed.setIsPlaying(false);
  return;
}


const Home: NextPage = () => {
  const [model, setModel] = useState< SPICE>();
  const [ddspModel, setDdspModel] = useState<DDSP>();
  const isPlayingUsed = useIsPlaying();
  
  const [tracks, setTracks] = useState<Track<MidiNoteSequence | AudioBuffer>[]>([]);
  // const [resultBuffer, setResultBuffer] = useState<string | null>();
  const [showPianoRoll, setShowPianoRoll] = useState<boolean>(false);
  
  const [bpm, setBpm] = useState<number>();
  const [selected, setSelected] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null)
  const [globalContext, setGlobalContext] = useState<AudioContext>();

  useEffect(()=>{
    if (bpm != undefined){
      Tone.Transport.bpm.value= bpm;
    }

  }, [bpm]);
  
  

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
  const player = new Tone.Player().toDestination();
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
      if (each.data.duration > max) {
        max = each.data.duration;
      }
    }


    console.log("TIMES:\nTone.now():", Tone.now(), " \n Tone.Transport():", Tone.Transport.now());
    console.log("Synced?", Tone.now() == Tone.Transport.now());
    for (let track of tracks) {
      if (track.data instanceof AudioBuffer) {
        let id = Tone.Transport.scheduleOnce((time) => {

          console.log("HERE IN RECORDED:");
          let diff = Tone.Transport.now() - track.soundMaker.now();
          console.log("DIFF: ", diff);
          console.log("Time in callback: ", time);
          console.log("Time of Tone.now()", Tone.now());
          console.log("Time of Player.now()", track.soundMaker.now());
          console.log("Time of Tone.Transport.now()", Tone.Transport.seconds);
          let start_time = diff == 0 ? time : time - diff;
          console.log(Tone.Time(Tone.Time("4n").toSeconds() + Tone.Time((track.edits.offsetFromStart / 18 / 2)).toSeconds()).toSeconds());
          (track.soundMaker as Tone.Player).start(Tone.Time(start_time + ((track.edits.offsetFromStart / 18 / 2))).toSeconds(), 0).stop(Tone.Time(start_time + Tone.Time((track.edits.offsetFromStart / 18 / 2) + track.data.duration + (track.edits.trimEnd / 18 / 2)).toSeconds()).toSeconds());
        }, 0);
        // setScheduledEvents(prev => [...prev, id])

      } else if (isMidiSequence(track)) {
        let id = Tone.Transport.scheduleOnce((time) => {
          console.log("HERE IN SYNTH:");
          let diff = Tone.Transport.now() - track.soundMaker.now();
          console.log("DIFF: ", diff);

          console.log("Time of callback", time);
          console.log("Tone of Synth.now()", track.soundMaker.now());
          console.log("Time of Tone.now()", Tone.now());
          console.log("Time of Tone.Transport.now()", Tone.Transport.seconds);
          let start_time = diff == 0 ? time : time - diff;

          let offset = Tone.Time(0).toSeconds();

          for (let bar = 0; bar < track.timesToLoop!; bar++) {

            for (let note of (track.data as MidiNoteSequence).data) {
              if (note != null) {
                (track.soundMaker as SynthPack).triggerAttackRelease(note, Tone.Time(track.tempo!).toSeconds(), Tone.Time("4n").toSeconds() + offset);
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
    console.log("starting", Tone.context.state)
    await Tone.context.resume();
    Tone.start();
    console.log("starting", Tone.context.state);
    isPlayingUsed.setIsPlaying(true);
    Tone.Transport.start();



  }



return (
  <isPlayingContext.Provider value={isPlayingUsed}>

      <div className='w-full h-screen bg-black flex flex-col items-center pt-24'>
        <div className='absolute top-0 left-0 w-full h-24 border-b border-gray-900 flex flex-row items-center'>
        <div className=' top-0 left-0 ml-8 h-24 flex flex-row items-center justify-center'>
          <button onClick={() => hanldeNewPianoRollTrack()} className='w-10 h-10 bg-white transition-all hover:bg-orange-500 mr-4 rounded-[100%] text-black text-3xl flex flex-col items-center justify-center'>+</button>
          <AudioRecorder onRecordingComplete={addAudioElement} />
          {selected != null && tracks[selected].data instanceof AudioBuffer && tracks.length != 0 && <button onClick={net} className='mx-4 w-32 h-12 bg-orange-500 rounded-md text-white'>Apply</button>}

        </div>
        <div className='ml-24 h-16 flex-1 flex-row justify-center items-center text-orange-500'>
          <button className='text-3xl font-bold mx-2' onClick={() => setBpm(prev => prev! > 0 ? prev! - 1 : prev)}>-</button><span className='text-white'>BPM: {bpm}</span><button className="text-3xl mx-2 font-orange-500 font-bold" onClick={() => setBpm(prev => prev! + 1)}>+</button>
          <button className='w-32 h-12 text-orange-500 rounded-md text-5xl' onClick={() => tracks.length > 0 && playAll()}>{!isPlayingUsed.isPlaying ? <span>&#9658;</span> : <span> &#9632;</span>}</button>
        </div>
        </div>
        
        <div className='w-full h-full flex flex-row' onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>e.preventDefault()}>

            <div className={`transition-all ${selected == null ? "w-full h-full" : "w-9/12 h-4/6"} overflow-y-auto`}>

            <TrackView playAll={playAll}setBpm={setBpm} selected={selected} setSelected={setSelected} setTracks={setTracks} bpm={bpm!}globalContext={globalContext!}tracks={tracks}></TrackView>
            </div>
            {selected!= null && <div className='w-3/12'>
              {tracks[selected].data instanceof AudioBuffer ? <SamplePanel selected={selected} setTracks={setTracks} track={tracks[selected]}/> :<SynthPanel bpm={bpm!}setTracks={setTracks} tracks={tracks} selected={selected}/>}
              </div>} 
            {showPianoRoll && isMidiSequence(tracks[selected!]) && !(tracks[selected!] instanceof AudioBuffer)  && <PianoRoll selected={selected} track={tracks[selected!]} showPianoRoll={showPianoRoll} setTracks={setTracks} setShowPianoRoll={setShowPianoRoll}/>}
        </div>

       
   

      </div>

  </isPlayingContext.Provider>
    )

}

export default Home
