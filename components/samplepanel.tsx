import React, { useEffect, useState } from 'react'
import { MidiNoteSequence } from '../typesandconsts'
import { Track } from '../typesandconsts'
import { flushSync } from 'react-dom';

interface SamplePanelProps{
    track: Track<AudioBuffer>,
    selected: number,
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
    selectedInstrument: string | null,
  net: () => Promise<void>,
}

const SamplePanel: React.FC<SamplePanelProps> = ({track, setTracks, selected, selectedInstrument, net}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    })
    await net();
    setIsLoading(false);
  };
  useEffect(()=>{
    console.log("CHANGEd");
    setIsLoading(false);
  }, [track])
  return (
    <div className='w-full text-white flex flex-col mt-28 space-y-2 flex-1'>
      <span>Instrument</span>
      <select value={selectedInstrument!} className='w-10/12 h-12 border-white border rounded-md p-2 text-white bg-black' name="Instrument..." id="">
        <option value="Trumpet">Trumpet</option>
        <option value="Violin">Violin</option>
        <option value="Saxophone">Saxophone</option>
        <option value="Flute">Flute</option>
        <option value="Guitar" disabled>Guitar (Coming Soon)</option>
        <option value="Synth" disabled>Synth (Coming Soon)</option>
        <option value="Piano" disabled>Piano (Coming Soon)</option>
      </select>
      <button onClick={handleApplyInstrument} className='mb-8 w-10/12 h-12 rounded-md flex flex-row items-center justify-center bg-orange-500'>{isLoading
      ?
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> 
      : <span>Apply</span>}</button>
      <span className=''>Volume</span>
      <input value={track.soundMaker.volume.value} onChange={handleVolumeChange} type="range" min ={-20} step={0.1} max={20} />
    </div>
  )
}

export default SamplePanel;