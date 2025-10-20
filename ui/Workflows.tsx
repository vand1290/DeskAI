import React, { useState } from 'react';
import { WorkflowList } from './components/WorkflowList';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { TaskChain } from '../src/taskChain';

type WorkflowView = 'list' | 'builder';

export const Workflows: React.FC = () => {
  const [view, setView] = useState<WorkflowView>('list');
  const [selectedChainId, setSelectedChainId] = useState<string | undefined>();

  const handleCreateNew = () => {
    setSelectedChainId(undefined);
    setView('builder');
  };

  const handleSelectWorkflow = (chainId: string) => {
    setSelectedChainId(chainId);
    setView('builder');
  };

  const handleSave = (_chain: TaskChain) => {
    setView('list');
    setSelectedChainId(undefined);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedChainId(undefined);
  };

  return (
    <div className="workflows-container">
      {view === 'list' ? (
        <WorkflowList
          onSelectWorkflow={handleSelectWorkflow}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <WorkflowBuilder
          chainId={selectedChainId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
