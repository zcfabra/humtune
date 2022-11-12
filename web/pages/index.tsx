import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

const mm = require("@magenta/music/node")
import { useEffect } from 'react'


const Home: NextPage = () => {
  useEffect(()=>{

    (async ()=>{const spice = new mm.SPICE();
    await spice.initialize() 
    console.log(spice)
  })();
  }, [])
// https://storage.googleapis.com/magentadata/js/checkpoints/ddsp/trumpet/group1-shard1of1.bin

  return (
      <div className='w-full h-screen bg-blue-500 flex flex-col items-center'>
        <h1>Hi</h1>

      </div>
    )

}

export default Home
