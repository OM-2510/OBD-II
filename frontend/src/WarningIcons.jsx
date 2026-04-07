import { TriangleAlert } from 'lucide-react';

export default function WarningIcons(){
    return(
        <div className="flex items-center justify-center text-red-700 border-white-2 animate-pulse duration-100">
            <TriangleAlert />
            <p>Clutch Slip Warning!</p>
        </div>
    )
}