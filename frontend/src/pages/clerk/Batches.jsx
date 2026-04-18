import React from 'react';
import BatchList from '../admin/batches/List';

const ClerkBatches = () => (
    <BatchList allowCreate={false} allowEdit={false} showApplications={false} />
);

export default ClerkBatches;
