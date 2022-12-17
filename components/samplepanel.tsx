import React from 'react'
import { MidiNoteSequence } from '../typesandconsts'
import { Track } from '../typesandconsts'

interface SamplePanelProps{
    track: Track<AudioBuffer>,
    selected: number,
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
}

const SamplePanel: React.FC<SamplePanelProps> = ({track, setTracks, selected}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setTracks(prev=>{
      prev[selected].soundMaker.volume.value = Number(e.target.value)
      return [...prev]
    })
  }
  return (
    <div className='w-full text-white flex flex-col '>
      <span>Volume</span>
      <input value={track.soundMaker.volume.value} onChange={handleVolumeChange} type="range" min ={-20} step={0.1} max={20} />
    </div>
  )
}

export default SamplePanel;