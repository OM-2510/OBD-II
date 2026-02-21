import { TriangleAlert } from 'lucide-react'

export default function ClutchSlipWarning(){
    return(
        <div className="flex items-center justify-center text-red-700 border-white-2 animate-pulse duration-100">
            <TriangleAlert />
            <p className='lg:text-xl text-2xl'>Clutch Slip Warning!</p>
        </div>
    )
}