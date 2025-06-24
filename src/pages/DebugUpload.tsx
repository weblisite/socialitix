import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const DebugUpload: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testUpload = async () => {
    setUploading(true);
    setLog([]);
    
    try {
      // Create a small test file
      const testContent = 'test video content';
      const testFile = new File([testContent], 'test.mp4', { type: 'video/mp4' });
      
      addLog('Starting upload test...');
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      addLog(`Session: ${session ? 'Found' : 'Not found'}`);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('video', testFile);
      
      addLog('Sending upload request...');
      
      // Upload
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        },
        body: formData
      });
      
      addLog(`Upload response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        addLog(`Upload response: ${JSON.stringify(result, null, 2)}`);
        
        if (result.video && result.video.id) {
          const videoId = result.video.id;
          addLog(`Video ID: ${videoId}`);
          
          // Test status polling
          addLog('Testing status polling...');
          await testStatusPolling(videoId);
        } else {
          addLog('ERROR: No video ID in response');
        }
      } else {
        const errorText = await response.text();
        addLog(`Upload failed: ${errorText}`);
      }
      
    } catch (error) {
      addLog(`Upload error: ${error}`);
    }
    
    setUploading(false);
  };

  const testStatusPolling = async (videoId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      addLog(`Polling status for video: ${videoId}`);
      
      const response = await fetch(`/api/videos/${videoId}`, {
        headers: {
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      addLog(`Status poll response: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Status data: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        addLog(`Status poll failed: ${errorText}`);
      }
      
    } catch (error) {
      addLog(`Status polling error: ${error}`);
    }
  };

  const testDebugEndpoint = async () => {
    try {
      addLog('Testing debug endpoint...');
      
      const response = await fetch('/api/videos/debug/status/615cac25-e644-4c50-9568-a871e49b765a');
      addLog(`Debug response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Debug data: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        addLog(`Debug failed: ${errorText}`);
      }
      
    } catch (error) {
      addLog(`Debug error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Debug</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testUpload}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            {uploading ? 'Testing Upload...' : 'Test Upload Process'}
          </button>
          
          <button
            onClick={testDebugEndpoint}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium ml-4"
          >
            Test Debug Endpoint
          </button>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Debug Log</h2>
          <div className="bg-black rounded p-4 h-96 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-gray-400">Click "Test Upload Process" to start debugging...</p>
            ) : (
              <div className="space-y-1">
                {log.map((entry, index) => (
                  <div key={index} className="text-sm text-green-400 font-mono">
                    {entry}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 