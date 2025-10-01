    // src/app/api-doc/react-swagger.tsx
    'use client'; // Mark as client component for Next.js App Router

    import SwaggerUI from 'swagger-ui-react';
    import 'swagger-ui-react/swagger-ui.css';

    type Props = {
      spec: Record<string, unknown>;
    };

    function ReactSwagger({ spec }: Props) {
      return <SwaggerUI spec={spec} />;
    }

    export default ReactSwagger;