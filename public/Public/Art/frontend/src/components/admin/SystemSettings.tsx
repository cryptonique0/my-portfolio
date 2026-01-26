import React from 'react';
import { useAdminSettings } from '../../hooks/useAdmin';

export const SystemSettings: React.FC = () => {
  const { settings, loading, updateSetting } = useAdminSettings();
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState('');

  const handleSave = async (key: string) => {
    try {
      await updateSetting(key, editingValue);
      setEditingKey(null);
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  const settingsArray = Object.entries(settings || {});

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">⚙️ System Settings</h2>

      {settingsArray.length === 0 ? (
        <div className="p-4 bg-gray-100 rounded text-center text-gray-600">
          No system settings configured yet
        </div>
      ) : (
        <div className="space-y-3">
          {settingsArray.map(([key, value]: [string, any]) => (
            <div key={key} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{key}</h3>
                  {editingKey === key ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(key)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingKey(null);
                            setEditingValue('');
                          }}
                          className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="text-xs bg-gray-100 rounded p-2 font-mono max-h-24 overflow-y-auto">
                        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                      </div>
                      <button
                        onClick={() => {
                          setEditingKey(key);
                          setEditingValue(typeof value === 'string' ? value : JSON.stringify(value));
                        }}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-bold text-sm mb-2">💡 Add New Setting</h3>
        <p className="text-xs text-gray-600">
          To add new settings, use the API or database directly with the admin credentials.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
