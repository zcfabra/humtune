import React from 'react'

interface TrackViewProps {

    tracks: AudioBuffer[]
}

const  TrackView: React.FC<TrackViewProps> = ({tracks}) => {
  return (
    <div className='w-full bg-black h-full'>

        {tracks.map((i, ix)=>(
            <div className='h-16 bg-gray-900 border-gray-600 border-y' style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div>
        ))}

    </div>
    )
}

export default TrackView 