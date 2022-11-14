import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import dynamic from 'next/dynamic'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder'

import React, { useEffect, useRef, useState } from 'react'
import {DDSP, SPICE} from "@magenta/music"



const Home: NextPage = () => {
  const [model, setModel] = useState< SPICE>();
  const [ddspModel, setDdspModel] = useState<DDSP>();
  const [savedBuffer, setSavedBuffer] = useState<AudioBuffer>();
  const [resultBuffer, setResultBuffer] = useState<string | null>();
  const audioRef = useRef<HTMLAudioElement>(null);  
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

  })();
    
  }, [])
// https://storage.googleapis.com/magentadata/js/checkpoints/ddsp/trumpet/group1-shard1of1.bin
const [soundInput, setSoundInput] = useState<string | null>();
const handleUpload = (e: React.ChangeEvent<HTMLInputElement>)=>{
  console.log(e.target.files);
}  
const addAudioElement = async (blob: Blob)=>{
  const ctx = new AudioContext();
  console.log(blob)
  
  let buf = await blob.arrayBuffer();
  let audbuf =  await ctx.decodeAudioData(buf);
  console.log("AUDIO BUFFER: ", audbuf);
  setSavedBuffer(audbuf);
  const url = URL.createObjectURL(blob);
  console.log("--------",url)
  setSoundInput(url) 
}

const thing = async ()=>{
  console.log("AUDIOREF: ",audioRef.current?.baseURI)
  console.log("AUDIO DATA: ", soundInput)



  const features = await model?.getAudioFeatures(savedBuffer!);
  console.log(features);
  if (typeof window !== "undefined"){
    
    
    const out = await ddspModel!.synthesize(features);
    console.log(out)
    
    let blob: Blob = new Blob([new Uint8Array(out.buffer, out.byteOffset, out.byteLength)] , {type: "audio/webm;codecs=opus"})
    console.log(blob)
    let resBuf = URL.createObjectURL(blob);
    console.log(resBuf);
    setResultBuffer(resBuf);
  }

}
return (
      <div className='w-full h-screen bg-blue-500 flex flex-col items-center'>
        <AudioRecorder onRecordingComplete={addAudioElement}/>
        {soundInput && <div>
          <audio controls={true} ref={audioRef}src={soundInput}></audio>
          <button onClick={()=>setSoundInput(null)}>X</button>
          <button onClick={()=>thing()}>Do the thing</button>
          </div>}
          {resultBuffer && 
          <audio controls={true} >
            <source src={resultBuffer} type="audio/webm;codescs=opus"/>
            </audio>}
      </div>
    )

}

export default Home
