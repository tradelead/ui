import { createContext } from 'react';

const AppContext = createContext({
  auth: {},
  trader: {},
});
export default AppContext;
