import { createContext } from 'react';
import { LocationInfo } from '@/components/LocationInfo';

interface CurrLocationContextType {
  CurrLocation: LocationInfo | null;
  setCurrLocation: (CurrLocation: LocationInfo | null) => void;
}

export const CurrLocationContext = createContext<CurrLocationContextType>({
    CurrLocation: null,
    setCurrLocation: () => {},
});
