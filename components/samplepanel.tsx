import React, { SetStateAction, useEffect, useState } from 'react'
import { MidiNoteSequence } from '../typesandconsts'
import { Track } from '../typesandconsts'
import { flushSync } from 'react-dom';
import { DDSP } from '@magenta/music';
import { copyFromBufToBuf } from '../pages';

interface SamplePanelProps{
    track: Track<AudioBuffer>,
    selected: number,
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
    selectedInstrument: string | null,
  handleNewModel: (instrument: string) => Promise<void>
  net: () => Promise<void>,
  setSelectedInstrument: React.Dispatch<SetStateAction<string>>
}

const SamplePanel: React.FC<SamplePanelProps> = ({track, setTracks, selected, selectedInstrument, net, setSelectedInstrument, handleNewModel}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading]=useState<boolean>(false);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setTracks(prev=>{
      prev[selected].soundMaker.volume.value = Number(e.target.value)
      return [...prev]
    });

  };
  const handleApplyInstrument = async ()=>{
    // setIsLoading(true);
    flushSync(()=>{
      setIsLoading(true);
    });
    await net();
    setIsLoading(false);
  };
  const handleChangeModel = async(instrument:string)=>{
    console.log(instrument)
    flushSync(()=>{
      setIsModelLoading(true);
    });
    await handleNewModel(instrument);
    setIsModelLoading(false);
    setSelectedInstrument(instrument)

  }
  useEffect(()=>{
    console.log("CHANGEd");
    setIsLoading(false);
  }, [track]);
  const handleRevertTrack = ()=>{
    setTracks(prev=>{
      copyFromBufToBuf(prev[selected].originalData as AudioBuffer, prev[selected].data as AudioBuffer);
      prev[selected].hasBeenAltered = false;
      return [...prev];
    })
  }
  return (
    <div className='w-full text-white flex flex-col mt-28 space-y-2 flex-1'>
      <span>Instrument</span>
      <select  onChange={async (e)=>await handleChangeModel(e.target.value)} className='w-10/12 h-12 border-white border rounded-md p-2 text-white bg-black' name="Instrument..." id="">
        <option value="trumpet">Trumpet</option>
        <option value="violin">Violin</option>
        <option value="tenor_saxophone">Tenor Saxophone</option>
        <option value="flute">Flute</option>
        <option value="Guitar" disabled>Guitar (Coming Soon)</option>
        <option value="Synth" disabled>Synth (Coming Soon)</option>
        <option value="Piano" disabled>Piano (Coming Soon)</option>
      </select>
      {!isModelLoading && <button onClick={handleApplyInstrument} className='mb-8 w-10/12 h-12 rounded-md flex flex-row items-center justify-center bg-orange-500'>{isLoading
      ?
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> 
      : <span>Apply</span>}</button>}
      { track.hasBeenAltered && <button onClick={handleRevertTrack} className='w-10/12 h-12 rounded-md bg-black border-orange-500 border hover:bg-orange-500 text-orange-500 hover:text-white cursor-pointer transition-all'>Remove All</button>}
      <span className=''>Volume</span>
      <input className='accent-purple-500 h-2 appearance-none bg-purple-900 rounded-md ' value={track.soundMaker.volume.value} onChange={handleVolumeChange} type="range" min ={-20} step={0.1} max={20} />
    </div>
  )
}

export default SamplePanel;