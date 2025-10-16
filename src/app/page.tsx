'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <h1 className="text-3xl font-bold text-brand-primary mb-4">
            Component Testing
          </h1>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>

            <div className="flex gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <Button isLoading={isLoading} onClick={() => setIsLoading(!isLoading)}>
              Toggle Loading
            </Button>

            <Input label="Test Input" placeholder="Enter text..." />
            <Input label="Required Input" required placeholder="Required field" />
            <Input label="Error Input" error="This field has an error" />

            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          </div>
        </Card>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Test Modal"
        >
          <p className="mb-4">This is a test modal.</p>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </Modal>
      </div>
    </div>
  );
}