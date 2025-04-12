
import React from 'react';
import { AgentServiceAssignment as AssignmentComponent } from './AgentServiceAssignment/index';

// This is a wrapper component that imports the real component from the directory
// This maintains backward compatibility with existing imports
export const AgentServiceAssignment = () => {
  return <AssignmentComponent />;
};
