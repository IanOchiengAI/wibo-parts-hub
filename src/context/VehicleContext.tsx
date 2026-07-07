import React, { createContext, useContext, useState, useEffect } from "react";

interface Vehicle {
  make: string;
  model: string;
  year: string;
}

interface VehicleContextType {
  vehicle: Vehicle | null;
  setVehicle: (v: Vehicle | null) => void;
}

const VehicleContext = createContext<VehicleContextType>({
  vehicle: null,
  setVehicle: () => {},
});

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicle, setVehicleState] = useState<Vehicle | null>(() => {
    try {
      const stored = localStorage.getItem("wibo_selected_vehicle");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setVehicle = (v: Vehicle | null) => {
    setVehicleState(v);
    if (v) {
      localStorage.setItem("wibo_selected_vehicle", JSON.stringify(v));
    } else {
      localStorage.removeItem("wibo_selected_vehicle");
    }
  };

  return (
    <VehicleContext.Provider value={{ vehicle, setVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => useContext(VehicleContext);
