import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import dynamic from 'next/dynamic'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder'

import React, { useEffect, useRef, useState } from 'react'
import {DDSP, SPICE} from "@magenta/music"
import { encodeWAV } from '../utils'
import TrackView from '../components/trackview'

const Home: NextPage = () => {
  const [model, setModel] = useState< SPICE>();
  const [ddspModel, setDdspModel] = useState<DDSP>();

  const [savedBuffers, setSavedBuffers] = useState<AudioBuffer[]>([]);
  const [resultBuffer, setResultBuffer] = useState<string | null>();

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
  setSavedBuffers(prev=>[...prev , audbuf]);
  const url = URL.createObjectURL(blob);
  console.log("--------",url)
  setSoundInput(url) 
}



// const thing = async ()=>{
//   console.log("AUDIOREF: ",audioRef.current?.baseURI)
//   console.log("AUDIO DATA: ", soundInput)



//   const features = await model?.getAudioFeatures(savedBuffer!,0.0);
//   console.log(features);
//   if (typeof window !== "undefined"){
    
    
//     const out = await ddspModel!.synthesize(features);

//     const encoded = encodeWAV(out, 48000);

//     let blob = new Blob([encoded], {type: "audio/wav"}), url = URL.createObjectURL(blob);
//     console.log(blob);
//     console.log(url) 
//     setResultBuffer(url);
//   }

// }
return (
      <div className='w-full h-screen bg-gray-900 flex flex-col items-center pt-24'>
        <div className='absolute top-0 left-0 ml-8 h-24 flex flex-col items-center justify-center'>

          <AudioRecorder onRecordingComplete={addAudioElement}/>
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

            <TrackView selected={selected} setSelected={setSelected} bpm={bpm}globalContext={globalContext!}tracks={savedBuffers}></TrackView>
      </div>
    )

}

export default Home
