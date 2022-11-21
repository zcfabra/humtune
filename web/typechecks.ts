import { MidiNoteSequence } from "./components/midiform"
export const isMidiSequence = (x: any): boolean =>{
    if (x == undefined) {
        return false;
    }
    if (!( "data" in x)){
        return false;
    } 
    if (!("duration" in x)){
        return false
    }
    return true
}