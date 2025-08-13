import { Toolbar } from "@/ui/Toolbar";
import { Canvas } from "@/canvas/Canvas";

export default function App () {
    return (
        <div className= "h-screen w-screen flex flex-col bg-background text-foreground" >
            <Toolbar />
            <div className="flex-1">
                <Canvas />
            </div>
        </div>
    )
}