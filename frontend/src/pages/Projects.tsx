import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ClockIcon,
  FolderIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  createdDate: string;
  lastModified: string;
  videosCount: number;
  clipsCount: number;
  collaborators: string[];
  tags: string[];
  progress: number;
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastModified');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Q1 Marketing Campaign',
        description: 'Complete video campaign for Q1 product launches including social media clips and promotional content',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
        status: 'in-progress',
        createdDate: '2024-01-10',
        lastModified: '2024-01-15',
        videosCount: 8,
        clipsCount: 24,
        collaborators: ['John Doe', 'Jane Smith'],
        tags: ['marketing', 'campaign', 'social'],
        progress: 65
      },
      {
        id: '2',
        title: 'Product Tutorial Series',
        description: 'Educational video series covering all product features and use cases',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        status: 'completed',
        createdDate: '2024-01-05',
        lastModified: '2024-01-14',
        videosCount: 12,
        clipsCount: 36,
        collaborators: ['Mike Johnson'],
        tags: ['tutorial', 'education', 'product'],
        progress: 100
      },
      {
        id: '3',
        title: 'Brand Storytelling Project',
        description: 'Creating compelling brand story videos for website and social media',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
        status: 'draft',
        createdDate: '2024-01-12',
        lastModified: '2024-01-13',
        videosCount: 3,
        clipsCount: 5,
        collaborators: ['Sarah Wilson', 'Tom Brown', 'Lisa Davis'],
        tags: ['brand', 'storytelling', 'creative'],
        progress: 25
      }
    ];
    setProjects(mockProjects);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'lastModified':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      case 'createdDate':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      case 'progress':
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
        <p className="text-slate-400">Manage your video projects and campaigns</p>
      </div>

      {/* Projects Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Projects</h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Project Cards */}
          {[
            { name: 'Marketing Campaign Q1', videos: 12, clips: 45, status: 'Active' },
            { name: 'Product Launch Series', videos: 8, clips: 32, status: 'In Progress' },
            { name: 'Social Media Content', videos: 25, clips: 89, status: 'Active' },
            { name: 'Educational Series', videos: 15, clips: 56, status: 'Completed' },
          ].map((project, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Active' ? 'bg-green-100 text-green-800' :
                  project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Videos</span>
                  <span className="text-white">{project.videos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Clips Generated</span>
                  <span className="text-white">{project.clips}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm transition-colors">
                  View
                </button>
                <button className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded text-sm transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
