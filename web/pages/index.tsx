import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import dynamic from 'next/dynamic'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder'

import React, { useEffect, useRef, useState } from 'react'
import {DDSP, NoteSequence, SPICE} from "@magenta/music"
import { encodeWAV } from '../utils'
import TrackView, { Track } from '../components/trackview'
import PianoRoll from '../components/pianoroll'
import { MidiNoteSequence } from '../components/midiform'
import { isMidiSequence } from '../typechecks'
export const DEFAULT_SAMPLE_RATE = 44100;


import * as Tone from "tone"
import Panel from '../components/panel'

const Home: NextPage = () => {
  const [model, setModel] = useState< SPICE>();
  const [ddspModel, setDdspModel] = useState<DDSP>();

  const [tracks, setTracks] = useState<Track<MidiNoteSequence | AudioBuffer>[]>([]);
  const [resultBuffer, setResultBuffer] = useState<string | null>();
  const [showPianoRoll, setShowPianoRoll] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [bpm, setBpm] = useState<number>(75);
  const [selected, setSelected] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null)
  const [globalContext, setGlobalContext] = useState<AudioContext>();

 

  useEffect(()=>{
    selectedRef.current = selected;
  }, [selected])
  useEffect(()=>{
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

      // const ctx = new AudioContext();
      //  ctx.resume();
      // setGlobalContext(ctx);

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
  setTracks(prev=>[...prev , {soundMaker: player, data: audbuf}]);
}

const net = async ()=>{
  if (!(tracks[selected!].data instanceof AudioBuffer)){
    console.log('PLOW')
    return;
  } else {
    console.log("got here")
  const features= await model?.getAudioFeatures(tracks[selected!].data as AudioBuffer);
  const out = await ddspModel?.synthesize(features);
  if (out == undefined){
    console.log("BAILED");
    return;}
    if ("sampleRate" in tracks[selected!].data){
      const encoded = encodeWAV(out, (tracks[selected!].data as AudioBuffer).sampleRate);
      // Tone.start()
      const newAudioBuffer = await Tone.context.decodeAudioData(encoded.buffer);
      setTracks(prev=>{
        prev[selected!].data = newAudioBuffer!;
        return [...prev] 
      })
    }
    
}

}
const hanldeNewPianoRollTrack = ()=>{
  let newMidiTrack: MidiNoteSequence = {data: [...Array(16)].map(i=>null), duration:12.8} 
  let priorLength = tracks.length ;
  let limiter = new Tone.Limiter(-80).toDestination()
  setTracks(prev=>[...prev, {data: newMidiTrack, soundMaker: new Tone.Synth().connect(limiter).toDestination()}]);
  setSelected(priorLength);
  setShowPianoRoll(true);
  
  // setShowPianoRoll(true);
}

useEffect(()=>{
  console.log(selected)
  console.log(tracks)
  console.log(selected != null && isMidiSequence(tracks[selected]))
  if (selected !=null){
    if (isMidiSequence(tracks[selected])){
      setShowPianoRoll(true);
      console.log("hi")
    } else {
      setShowPianoRoll(false);
    }
  }
}, [selected])
useEffect(()=>{
  console.log(tracks)
},[tracks])

return (
      <div className='w-full h-screen bg-gray-900 flex flex-col items-center pt-24'>
        <div className='absolute top-0 left-0 ml-8 h-24 flex flex-row items-center justify-center'>
          <button onClick={()=>hanldeNewPianoRollTrack()} className='w-10 h-10 bg-white transition-all hover:bg-orange-500 mr-4 rounded-[100%] text-black text-3xl flex flex-col items-center justify-center'>+</button>
          <AudioRecorder onRecordingComplete={addAudioElement}/>
          { selected != null && tracks[selected].data instanceof AudioBuffer && tracks.length !=0 && <button onClick={net}className='mx-4 w-32 h-12 bg-orange-500 rounded-md text-white'>Apply</button>}
        </div>
        <div className='w-full h-full flex flex-row'>

            <div className={`transition-all ${selected == null ? "w-full h-full" : "w-9/12 h-4/6"} overflow-y-scroll`}>

            <TrackView selected={selected} setSelected={setSelected} bpm={bpm}globalContext={globalContext!}tracks={tracks}></TrackView>
            </div>
            {selected!= null && <div className='w-3/12'>
              <Panel setTracks={setTracks} tracks={tracks} selected={selected}/>
              </div>} 
            {showPianoRoll && isMidiSequence(tracks[selected!]) && !(tracks[selected!] instanceof AudioBuffer)  && <PianoRoll selected={selected} data={tracks[selected!].data as MidiNoteSequence} showPianoRoll={showPianoRoll} setTracks={setTracks} setShowPianoRoll={setShowPianoRoll}/>}
        </div>

       
   

      </div>
    )

}

export default Home
