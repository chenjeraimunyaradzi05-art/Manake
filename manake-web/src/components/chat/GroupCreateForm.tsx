import React, { useState } from 'react';
import { conversationService } from '../../services/conversationService';
import { Users, X, Check } from 'lucide-react';

interface GroupCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const GroupCreateForm: React.FC<GroupCreateFormProps> = ({ onSuccess, onCancel }) => {
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Split emails by comma and clean up
      // In a real app, you'd likely map these emails to IDs first via an API lookup
      // or the API handles email-to-user resolution.
      // For now, we assume the API expects IDs. Since we don't have a user search here,
      // we will assume the input IS IDs for this MVP step, OR we mock the resolution.
      // Let's assume the API is smart enough to take emails if we updated it, or we just pass the strings.
      // But looking at the service, it says "participantIds".
      // We will enter "Ids" for now to be safe with the 'logic' we built, 
      // or noted as "Enter User IDs (comma separated)"
      
      const participantIds = participants.split(',').map(s => s.trim()).filter(Boolean);
      
      await conversationService.createGroup(groupName, participantIds);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-primary-600" />
            Create Group
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                placeholder="e.g. Community Support"
                required
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Participants (User IDs)
                <span className="text-gray-400 font-normal ml-2 text-xs">Comma separated</span>
            </label>
            <textarea 
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none h-24"
                placeholder="user_123, user_456..."
            />
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <button 
                type="button" 
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading || !groupName.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md"
            >
                {loading ? 'Creating...' : (
                    <>
                        <Check size={18} /> Create Group
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};
