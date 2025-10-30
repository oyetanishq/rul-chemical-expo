"use client";

export interface BatteryData {
    cycle_index: number | string;
    discharge_time: number | string;
    decrement: number | string;
    max_voltage_discharge: number | string;
    min_voltage_dcharge: number | string;
    time_at_4_15: number | string;
    time_constant_current: number | string;
    charging_time: number | string;
}

export interface PredictionResult {
    predicted_rul: number;
}

import { Loader } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const FEATURE_METADATA = [
    { key: "cycle_index", label: "Cycle Index (N)", unit: "cycles", description: "The sequential number of the completed charge-discharge cycle." },
    { key: "discharge_time", label: "Discharge Time (s)", unit: "seconds", description: "The total time the battery took to complete the discharge process (at a 1.5C rate)." },
    {
        key: "decrement",
        label: "Decrement 3.6-3.4V (s)",
        unit: "seconds",
        description: "The time required for the battery's voltage to drop from 3.6 V to 3.4 V during the discharge phase.",
    },
    { key: "max_voltage_discharge", label: "Max. Voltage Discharge (V)", unit: "Volts", description: "The maximum voltage recorded at the start of the discharge phase." },
    {
        key: "min_voltage_dcharge",
        label: "Min. Voltage Discharge (V)",
        unit: "Volts",
        description: "The minimum voltage recorded at the start of the charge phase (the cutoff voltage from the previous discharge).",
    },
    { key: "time_at_4_15", label: "Time at 4.15V (s)", unit: "seconds", description: "The total time the battery spent at the voltage 4.15 V (or above) during the charging phase." },
    {
        key: "time_constant_current",
        label: "Time Constant Current (s)",
        unit: "seconds",
        description: "The duration of the Constant Current (CC) phase during the battery's charge cycle (at a C/2 rate).",
    },
    { key: "charging_time", label: "Charging Time (s)", unit: "seconds", description: "The total time the battery took to complete the entire charge cycle (CC + CV)." },
] as const;

const initialFormData: BatteryData = {
    cycle_index: "",
    discharge_time: "",
    decrement: "",
    max_voltage_discharge: "",
    min_voltage_dcharge: "",
    time_at_4_15: "",
    time_constant_current: "",
    charging_time: "",
};

export default function RULPredictor() {
    const [formData, setFormData] = useState<BatteryData>(initialFormData);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => await fetch(process.env.NEXT_PUBLIC_PREDICT_API_URL!))();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (value === "" || /^-?\d*\.?\d*$/.test(value)) setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setPrediction(null);

        // Basic form validation (check for empty strings)
        const emptyFields = Object.entries(formData).filter(([key, value]) => value === "");
        if (emptyFields.length > 0) {
            setError("Please fill in all input fields.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_PREDICT_API_URL! + "/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data: PredictionResult = await response.json();
            setPrediction(data);
        } catch (err) {
            setError(`Failed to fetch prediction. ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-base-light text-base-dark p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 p-6 border border-base-dark rounded-none bg-white shadow-lg">
                    <h1 className="text-4xl font-extrabold text-base-dark mb-2">RUL Prediction Engine</h1>
                    <p className="text-lg text-stone-600">
                        Estimate the Remaining Useful Life (RUL) of <b>NMC-LCO 18650 Li-ion batteries</b> based on cycle-level degradation features.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Form Column (Col 1-2) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 border border-base-dark bg-white rounded-none shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 border-b border-base-dark pb-2 text-accent-warm">Input Battery Cycle Features</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {FEATURE_METADATA.map(({ key, label }) => (
                                <div key={key} className="flex flex-col">
                                    <label htmlFor={key} className="text-sm font-medium mb-1 text-base-dark">
                                        {label}
                                    </label>
                                    <input
                                        type="number"
                                        id={key}
                                        name={key}
                                        value={formData[key as keyof BatteryData]}
                                        onChange={handleChange}
                                        placeholder="Enter value"
                                        className="p-3 bg-base-light border border-base-dark text-base-dark focus:outline-none focus:border-accent-warm rounded-none transition-colors"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-8 w-full flex justify-center items-center bg-yellow-500 text-black border border-black text-xs md:text-sm h-12 font-semibold uppercase cursor-pointer  transition-all duration-100 ease-in-out  shadow-[4px_4px_0px_0px_#000000]  hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000]  active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0px_0px_0px_#00000040]  disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader className="size-5 animate-spin" /> : "Predict Remaining Useful Life"}
                        </button>

                        {error && <p className="mt-4 p-3 bg-red-100 border border-red-500 text-red-700 text-sm rounded-none">Error: {error}</p>}

                        {/* RUL Output */}
                        <div className="p-6 border border-base-dark bg-base-dark text-white rounded-none shadow-lg mt-8">
                            <h2 className="text-2xl font-bold mb-4 border-b border-white/50 pb-2 text-black">Predicted RUL</h2>
                            {prediction ? (
                                <div className="text-center">
                                    <p className="text-5xl font-extrabold text-black">{prediction.predicted_rul.toLocaleString()}</p>
                                    <p className="text-lg font-medium text-amber-300 mt-2">Remaining Cycles</p>
                                </div>
                            ) : (
                                <p className="text-stone-400 text-center py-4">Submit data to see the predicted remaining useful life (in cycles).</p>
                            )}
                        </div>
                    </form>

                    {/* Output and Description Column (Col 3) */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Feature Description Panel */}
                        <div className="p-6 border border-base-dark bg-white rounded-none shadow-lg">
                            <h3 className="text-xl font-bold mb-4 text-base-dark">Feature Overview</h3>
                            <ul className="space-y-3 text-sm text-stone-700">
                                {FEATURE_METADATA.map(({ key, label, description }) => (
                                    <li key={key} className="border-b border-stone-200 pb-2">
                                        <span className="font-semibold text-base-dark">{label}: </span>
                                        {description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
