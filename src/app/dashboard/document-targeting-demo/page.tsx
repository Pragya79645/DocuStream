'use client';

import { DocumentTargetingDemo } from '@/components/demo/document-targeting-demo';
import { DocumentTargetingVisibilityDemo } from '@/components/demo/document-targeting-visibility-demo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocumentTargetingDemoPage() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="classification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classification">Document Classification</TabsTrigger>
          <TabsTrigger value="visibility">Targeting & Visibility</TabsTrigger>
        </TabsList>

        <TabsContent value="classification" className="space-y-6">
          <DocumentTargetingDemo />
        </TabsContent>

        <TabsContent value="visibility" className="space-y-6">
          <DocumentTargetingVisibilityDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}