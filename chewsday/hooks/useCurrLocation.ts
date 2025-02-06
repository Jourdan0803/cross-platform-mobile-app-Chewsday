import { useEffect, useState } from "react";
import { LocationInfo } from "@/components/LocationInfo";

export function useCurrLocation(): [
    LocationInfo | null,
    (CurrLocation: LocationInfo | null) => void
] {
  const [CurrLocation, setCurrLocation] = useState< LocationInfo | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      setCurrLocation(null);
    };
    getLocation();
  }, []);

  return [CurrLocation, setCurrLocation];
}