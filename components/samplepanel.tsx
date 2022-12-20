import React, { MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { MidiNoteSequence } from '../typesandconsts'
import { Track } from '../typesandconsts'
import { flushSync } from 'react-dom';
import { DDSP } from '@magenta/music';
import { copyFromBufToBuf } from '../pages';

interface SamplePanelProps{
    selected: number,
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
    selectedInstrument: string | null,
    tracks: Track<AudioBuffer | MidiNoteSequence>[],
    handleNet:  (i: string)=>Promise<void>,
  setSelectedInstrument: React.Dispatch<SetStateAction<string>>
}

const SamplePanel: React.FC<SamplePanelProps> = ({ setTracks, selected, selectedInstrument, handleNet, tracks, setSelectedInstrument}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading]=useState<boolean>(false);
  // const selectedRef = useRef<HTMLSelectElement>(null);
  const [localSelectedInstrument, setLocalSelectedInstrument] = useState<string>();
  useEffect(()=>{
    setLocalSelectedInstrument(selectedInstrument!);
  },[selectedInstrument, selected])
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setTracks(prev=>{
      prev[selected].soundMaker.volume.value = Number(e.target.value)
      return [...prev]
    });

  };

  const handleRevertTrack = ()=>{
    setTracks(prev=>{
      copyFromBufToBuf(prev[selected].originalData as AudioBuffer, prev[selected].data as AudioBuffer);
      prev[selected].hasBeenAltered = null;
      return [...prev];
    })
  }
  const handleApplyInstrument =async  ()=>{
    flushSync(()=>setIsLoading(true))
    await handleNet(localSelectedInstrument!);
    setIsLoading(false)

  }
  return (
    <div className='w-full h-full border border-gray-900 text-white flex flex-col flex-1 p-8'>
      <span>Instrument</span>
      {/* <pre>{tracks[selected].hasBeenAltered}</pre> */}
      <select value={tracks[selected].hasBeenAltered != null ?tracks[selected].hasBeenAltered!:localSelectedInstrument} onChange={(e)=>setLocalSelectedInstrument(e.target.value)} className='w-10/12 mt-2 mb-2 h-12 border-white border rounded-md p-2 text-white bg-black' name="Instrument..." id="">
        <option value="trumpet">Trumpet</option>
        <option value="violin">Violin</option>
        <option value="tenor_saxophone">Tenor Saxophone</option>
        <option value="flute">Flute</option>
        <option value="Guitar" disabled>Guitar (Coming Soon)</option>
        <option value="Synth" disabled>Synth (Coming Soon)</option>
        <option value="Piano" disabled>Piano (Coming Soon)</option>
      </select>
      {!isModelLoading && <button onClick={handleApplyInstrument} className='mb-2 w-10/12 h-12 rounded-md flex flex-row items-center justify-center bg-orange-500'>{isLoading
      ?
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> 
      : <span>Apply</span>}</button>}
      { tracks[selected].hasBeenAltered && <button onClick={handleRevertTrack} className='w-10/12 h-12 rounded-md bg-black border-orange-500 border hover:bg-orange-500 text-orange-500 hover:text-white cursor-pointer transition-all'>Remove All</button>}
      <div className='w-full mt-8 flex flex-col'>
        <span className='mb-2'>Volume</span>
        <input className='accent-purple-500 h-2 appearance-none bg-purple-900 rounded-md w-10/12' value={tracks[selected].soundMaker.volume.value} onChange={handleVolumeChange} type="range" min ={-20} step={0.1} max={20} />
      </div>
    </div>
  )
}

export default SamplePanel;