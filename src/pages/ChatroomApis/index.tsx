// import { useState } from 'react';
import { useParams } from 'react-router-dom';

import APIForm from '@/components/APIForm';
import { V2NIMConfigMap, V2NIMServiceType } from '@/configs/apiParams/V2NIM.config';

const APIs = () => {
  const { service, method } = useParams();

  const renderContent = () => {
    if (service === undefined) {
      return <div>empty</div>;
    }

    const methodConfig = V2NIMConfigMap[service as V2NIMServiceType]?.[method as string];

    return (
      <APIForm
        interfaceName={service as V2NIMServiceType}
        methodName={method as string}
        methodConfig={methodConfig}
      />
    );
  };

  return renderContent();
};

export default APIs;
