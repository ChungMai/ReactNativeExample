import React from 'react';
import type { ViewModelFactory } from './ViewModelFactory';

export const ViewModelFactoryContext = React.createContext<ViewModelFactory | null>(null);
