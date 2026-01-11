import GaugeComponent from "react-gauge-component";

export default function PowerandTorqueGauge({PEAK_HP, PEAK_TORQUE, CURR_HP, CURR_TORQUE}){
    return(
        <>
            <div>
                <GaugeComponent 
                    type="semicircle"
                    value={CURR_TORQUE}
                    minValue={0}
                    maxValue={PEAK_TORQUE}
                    arc={{
                        width:0.2,
                        padding: 0,
                        cornerRadius: 1,
                        subArcs: [{
                            limit: CURR_TORQUE,
                            color: "#f97316",
                            showTick: false
                        },
                        {
                            color:"#343231",
                            showTick: false
                        }
                        ]
                    }}
                    pointer={{
                        type: "needle",
                        color: "#ffffff",
                        width: 3,
                        length: 1,
                    }}
                    labels={{
                        valueLabel: {
                            hide: true
                        },
                        tickLabels: {
                            hideMinMax: true
                        }

                    }}
                />

                <h3 className="text-white text-center">Torque</h3>
            </div>
                    
            <div>
                <GaugeComponent 
                    type="semicircle"
                    value={CURR_HP}
                    minValue={0}
                    maxValue={PEAK_HP}
                    arc={{
                        width:0.2,
                        padding: 0,
                        cornerRadius: 1,
                        subArcs: [{
                            limit: CURR_HP,
                            color: "#ffff00",
                            showTick: false
                        },
                        {
                            color:"#343231",
                            showTick: false
                        }
                        ]
                    }}
                    pointer={{
                        type: "needle",
                        color: "#ffffff",
                        width: 3,
                        length: 1,
                    }}
                    labels={{
                        valueLabel: {
                            hide: true
                        },
                        tickLabels: {
                            hideMinMax: true
                        }

                    }}

                />

                <h3 className="text-white text-center">Power</h3>
            </div>
        </>
    )
};