import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import dynamic from 'next/dynamic'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder'

import React, { useEffect, useRef, useState } from 'react'
import {DDSP, NoteSequence, SPICE} from "@magenta/music"
import { encodeWAV } from '../utils'
import TrackView from '../components/trackview'
import PianoRoll from '../components/pianoroll'
import { MidiNoteSequence } from '../components/midiform'
import { isMidiSequence } from '../typechecks'
export const DEFAULT_SAMPLE_RATE = 44100;
const Home: NextPage = () => {
  const [model, setModel] = useState< SPICE>();
  const [ddspModel, setDdspModel] = useState<DDSP>();

  const [tracks, setTracks] = useState<(AudioBuffer | MidiNoteSequence)[]>([]);
  const [resultBuffer, setResultBuffer] = useState<string | null>();
  const [showPianoRoll, setShowPianoRoll] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [bpm, setBpm] = useState<number>(75);
  const [selected, setSelected] = useState<number | null>(null);
  const [globalContext, setGlobalContext] = useState<AudioContext>();
  useEffect(()=>{
      

    
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

      const ctx = new AudioContext();
       ctx.resume();
      setGlobalContext(ctx);

  })();
    
  }, [])
// https://storage.googleapis.com/magentadata/js/checkpoints/ddsp/trumpet/group1-shard1of1.bin
const [soundInput, setSoundInput] = useState<string | null>();

const addAudioElement = async (blob: Blob)=>{
  console.log("*****")
  // const ctx = new AudioContext();
  // console.log(blob)
  let buf = await blob.arrayBuffer();
  let audbuf =  await globalContext!.decodeAudioData(buf);
  console.log("AUDIO BUFFER: ", audbuf);
  setTracks(prev=>[...prev , audbuf]);
  const url = URL.createObjectURL(blob);
  console.log("--------",url)
  setSoundInput(url) 
}

const net = async ()=>{
  if (!(tracks[selected!] instanceof AudioBuffer)){
    console.log('PLOW')
    return;
  } else {
  const features= await model?.getAudioFeatures(tracks[selected!] as AudioBuffer);
  const out = await ddspModel?.synthesize(features);
  if (out == undefined){
    console.log("BAILED");
    return;}
    if ("sampleRate" in tracks[selected!]){
      const encoded = encodeWAV(out, (tracks[selected!] as AudioBuffer).sampleRate);
      const newAudioBuffer = await globalContext!.decodeAudioData(encoded.buffer);
      setTracks(prev=>{
        prev[selected!] = newAudioBuffer!;
        return [...prev] 
      })
    }
    
}

}
const hanldeNewPianoRollTrack = ()=>{
  let newMidi: MidiNoteSequence = {data: [...Array(16)].map(i=>null), duration:12.8}  
  setTracks(prev=>[...prev, newMidi])  
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
          { selected != null && tracks[selected] instanceof AudioBuffer && tracks.length !=0 && <button onClick={net}className='mx-4 w-32 h-12 bg-orange-500 rounded-md text-white'>Apply</button>}
        </div>

        {soundInput && <div className='flex flex-col items-center'>
          {/* <audio className="my-8"controls={true} ref={audioRef}src={soundInput}></audio> */}
          {/* <button onClick={()=>setSoundInput(null)}>X</button> */}
          {/* <button className='w-32 mb-8 h-12 bg-orange-500 rounded-md text-white font-medium'>Do the thing</button> */}
          </div>         
}
          {/* {resultBuffer && 
          // <audio controls={true} >
            // <source src={resultBuffer} type="audio/webm;codescs=opus"/>
            </audio>} */}

            <TrackView selected={selected} setSelected={setSelected} bpm={bpm}globalContext={globalContext!}tracks={tracks}></TrackView>
            {showPianoRoll && isMidiSequence(tracks[selected!]) && !(tracks[selected!] instanceof AudioBuffer)  && <PianoRoll selected={selected} data={tracks[selected!] as MidiNoteSequence} showPianoRoll={showPianoRoll} setTracks={setTracks} setShowPianoRoll={setShowPianoRoll}/>}
      </div>
    )

}

export default Home
