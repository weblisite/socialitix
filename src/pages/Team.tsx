import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  lastActive: string;
  permissions: string[];
}

export const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Antony Mungai',
        email: 'antony@socialitix.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        role: 'admin',
        status: 'active',
        joinedDate: '2024-01-01',
        lastActive: '2024-01-15',
        permissions: ['all']
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@socialitix.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400',
        role: 'editor',
        status: 'active',
        joinedDate: '2024-01-05',
        lastActive: '2024-01-14',
        permissions: ['edit_videos', 'create_clips', 'view_analytics']
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike@socialitix.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        role: 'viewer',
        status: 'pending',
        joinedDate: '2024-01-12',
        lastActive: '2024-01-12',
        permissions: ['view_videos', 'view_clips']
      }
    ];
    setTeamMembers(mockTeamMembers);
  }, []);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400';
      case 'editor': return 'bg-blue-500/20 text-blue-400';
      case 'viewer': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="h-5 w-5 text-red-400" />;
      case 'editor': return <PencilIcon className="h-5 w-5 text-blue-400" />;
      case 'viewer': return <UserIcon className="h-5 w-5 text-green-400" />;
      default: return <UserIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
        <p className="text-slate-400">Manage your team members and permissions</p>
      </div>

      {/* Team Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Team Members</h2>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Invite Member
          </button>
        </div>

        {/* Team Members List */}
        <div className="space-y-4">
          {/* Sample Team Members */}
          {[
            { name: 'John Doe', email: 'john@socialitix.com', role: 'Admin', avatar: 'JD' },
            { name: 'Jane Smith', email: 'jane@socialitix.com', role: 'Editor', avatar: 'JS' },
            { name: 'Mike Johnson', email: 'mike@socialitix.com', role: 'Viewer', avatar: 'MJ' },
          ].map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-white font-medium">{member.name}</h3>
                  <p className="text-slate-400 text-sm">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.role === 'Admin' ? 'bg-red-100 text-red-800' :
                  member.role === 'Editor' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
                <button className="text-slate-400 hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none">
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message (Optional)</label>
                <textarea
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
