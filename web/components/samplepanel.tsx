import React from 'react'
import { MidiNoteSequence } from '../typesandconsts'
import { Track } from '../typesandconsts'

interface SamplePanelProps{
    track: Track<AudioBuffer>,
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
}

const SamplePanel: React.FC<SamplePanelProps> = () => {
  return (
    <div className='w-full bg-red-500'>
        
    </div>
  )
}

export default SamplePanel;