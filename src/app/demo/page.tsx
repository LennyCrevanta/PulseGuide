"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatWidgetProvider } from '@/components/chat/ChatWidgetProvider';

type WidgetPosition = 'bottom-right' | 'bottom-left' | 'side-right' | 'side-left';

export default function DemoPage() {
  const [widgetConfig, setWidgetConfig] = useState({
    position: 'bottom-right' as WidgetPosition,
    iconText: 'PG',
    title: 'PulseGuide Assistant',
    themeColor: '#1e40af',
    personaId: '',
  });
  
  const handlePositionChange = (position: WidgetPosition) => {
    setWidgetConfig(prev => ({ ...prev, position }));
  };
  
  const handleColorChange = (color: string) => {
    setWidgetConfig(prev => ({ ...prev, themeColor: color }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-800">PulseGuide Widget Demo</div>
          </div>
          <nav className="flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-800">Home</Link>
            <a href="#integration" className="text-gray-700 hover:text-blue-800">Integration</a>
            <a href="#customization" className="text-gray-700 hover:text-blue-800">Customization</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PulseGuide Chat Widget</h1>
          <p className="text-xl text-gray-600">
            Easily integrate our AI-powered benefits assistant into any HR tech experience
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Enhance Your Employee Experience</h2>
              <p className="text-gray-600 mb-4">
                The PulseGuide chat widget provides instant access to benefits information, policy details, 
                and HR guidance - right when and where your employees need it.
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li className="text-gray-600">Simple integration with any web platform</li>
                <li className="text-gray-600">Customizable appearance to match your brand</li>
                <li className="text-gray-600">Responsive design for all devices</li>
                <li className="text-gray-600">Seamless handoff to human agents when needed</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The widget is live on this page! Look for the chat button in the 
                  {widgetConfig.position === 'bottom-right' && " bottom right"}
                  {widgetConfig.position === 'bottom-left' && " bottom left"}
                  {widgetConfig.position === 'side-right' && " right side"}
                  {widgetConfig.position === 'side-left' && " left side"}
                  .
                </p>
              </div>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Customer service chat" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
        
        <div id="integration" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Easy Integration</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Just Add One Component</h3>
            <p className="text-gray-600 mb-6">
              Integrate the PulseGuide chat widget into your app with just a few lines of code.
            </p>
            <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto mb-6">
              <pre>{`import { ChatWidgetProvider } from '@pulseguide/chat-widget';

// Add this anywhere in your React component
return (
  <div>
    {/* Your existing application */}
    <ChatWidgetProvider 
      position="${widgetConfig.position}"
      iconText="${widgetConfig.iconText}"
      title="${widgetConfig.title}"
      themeColor="${widgetConfig.themeColor}"
    />
  </div>
);`}</pre>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Or Use Our Vanilla JS Script</h3>
            <p className="text-gray-600 mb-6">
              For non-React applications, you can use our script tag to add the widget to any webpage.
            </p>
            <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`<script src="https://cdn.pulseguide.com/widget.js"></script>
<script>
  PulseGuide.init({
    position: "${widgetConfig.position}",
    iconText: "${widgetConfig.iconText}",
    title: "${widgetConfig.title}",
    themeColor: "${widgetConfig.themeColor}"
  });
</script>`}</pre>
            </div>
          </div>
        </div>
        
        <div id="customization" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Customize the Widget</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 mb-6">
              Try different configurations to see how the widget would look in your application.
              Changes will be reflected in the live widget on this page.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Position</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handlePositionChange('bottom-right')}
                    className={`p-4 rounded-lg border-2 ${widgetConfig.position === 'bottom-right' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="relative h-32 border border-gray-300 rounded">
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-blue-600"></div>
                    </div>
                    <p className="text-center mt-2">Bottom Right</p>
                  </button>
                  
                  <button 
                    onClick={() => handlePositionChange('bottom-left')}
                    className={`p-4 rounded-lg border-2 ${widgetConfig.position === 'bottom-left' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="relative h-32 border border-gray-300 rounded">
                      <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-blue-600"></div>
                    </div>
                    <p className="text-center mt-2">Bottom Left</p>
                  </button>
                  
                  <button 
                    onClick={() => handlePositionChange('side-right')}
                    className={`p-4 rounded-lg border-2 ${widgetConfig.position === 'side-right' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="relative h-32 border border-gray-300 rounded">
                      <div className="absolute top-1/2 right-2 w-6 h-6 rounded-full bg-blue-600 transform -translate-y-1/2"></div>
                    </div>
                    <p className="text-center mt-2">Right Side</p>
                  </button>
                  
                  <button 
                    onClick={() => handlePositionChange('side-left')}
                    className={`p-4 rounded-lg border-2 ${widgetConfig.position === 'side-left' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="relative h-32 border border-gray-300 rounded">
                      <div className="absolute top-1/2 left-2 w-6 h-6 rounded-full bg-blue-600 transform -translate-y-1/2"></div>
                    </div>
                    <p className="text-center mt-2">Left Side</p>
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Theme Color</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: 'Blue', color: '#1e40af' },
                    { name: 'Purple', color: '#7e22ce' },
                    { name: 'Green', color: '#15803d' },
                    { name: 'Red', color: '#b91c1c' },
                    { name: 'Orange', color: '#c2410c' },
                    { name: 'Teal', color: '#0f766e' }
                  ].map((theme) => (
                    <button 
                      key={theme.color}
                      onClick={() => handleColorChange(theme.color)}
                      className={`p-4 rounded-lg border-2 ${widgetConfig.themeColor === theme.color ? 'border-gray-800' : 'border-gray-200'}`}
                    >
                      <div 
                        className="h-12 rounded"
                        style={{ backgroundColor: theme.color }}
                      ></div>
                      <p className="text-center mt-2">{theme.name}</p>
                    </button>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Widget Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Title</label>
                      <input 
                        type="text" 
                        value={widgetConfig.title}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Icon Text (1-2 characters)</label>
                      <input 
                        type="text" 
                        value={widgetConfig.iconText}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, iconText: e.target.value.slice(0, 2) }))}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Get Started?</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="md:flex-1">
              <p className="text-gray-600 mb-4">
                Add PulseGuide's AI-powered chat assistant to your benefits portal, HR system, or company intranet today.
              </p>
              <p className="text-gray-600">
                Our team can help you customize and integrate the widget to perfectly match your brand and meet your specific needs.
              </p>
            </div>
            <div className="md:flex-shrink-0">
              <a 
                href="#" 
                className="block w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                Request Demo Access
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Include the actual widget with the configured settings */}
      <ChatWidgetProvider
        position={widgetConfig.position}
        iconText={widgetConfig.iconText}
        title={widgetConfig.title}
        themeColor={widgetConfig.themeColor}
        personaId={widgetConfig.personaId}
      />
    </div>
  );
} 