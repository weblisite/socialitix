import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  StarIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  duration: string;
  rating: number;
  uses: number;
  tags: string[];
  isPremium: boolean;
  createdBy: string;
}

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    const mockTemplates: Template[] = [
      {
        id: '1',
        title: 'Product Showcase Template',
        description: 'Perfect for highlighting product features with dynamic transitions',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
        category: 'business',
        duration: '0:30',
        rating: 4.8,
        uses: 1240,
        tags: ['product', 'showcase', 'business'],
        isPremium: false,
        createdBy: 'Socialitix Team'
      },
      {
        id: '2',
        title: 'Social Media Story Template',
        description: 'Engaging vertical format perfect for Instagram and TikTok stories',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        category: 'social',
        duration: '0:15',
        rating: 4.9,
        uses: 2156,
        tags: ['social', 'story', 'vertical'],
        isPremium: true,
        createdBy: 'Creator Studio'
      },
      {
        id: '3',
        title: 'Tutorial Intro Template',
        description: 'Clean and professional intro for educational content',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
        category: 'education',
        duration: '0:10',
        rating: 4.7,
        uses: 892,
        tags: ['tutorial', 'intro', 'education'],
        isPremium: false,
        createdBy: 'EduCreators'
      },
      {
        id: '4',
        title: 'Brand Announcement Template',
        description: 'Eye-catching template for important brand announcements',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
        category: 'marketing',
        duration: '0:45',
        rating: 4.6,
        uses: 634,
        tags: ['brand', 'announcement', 'marketing'],
        isPremium: true,
        createdBy: 'Brand Studio'
      }
    ];
    setTemplates(mockTemplates);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.uses - a.uses;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'business', label: 'Business' },
    { value: 'social', label: 'Social Media' },
    { value: 'education', label: 'Education' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'entertainment', label: 'Entertainment' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Templates</h1>
              <p className="text-slate-400">Choose from professionally designed video templates</p>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5" />
              <span>Create Custom Template</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Templates</p>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                </div>
                <DocumentDuplicateIcon className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Premium Templates</p>
                  <p className="text-2xl font-bold text-white">{templates.filter(t => t.isPremium).length}</p>
                </div>
                <StarIcon className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Uses</p>
                  <p className="text-2xl font-bold text-white">{templates.reduce((sum, t) => sum + t.uses, 0).toLocaleString()}</p>
                </div>
                <PlayIcon className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-white">{(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)}</p>
                </div>
                <StarIcon className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none w-64"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedTemplates.map((template) => (
            <div key={template.id} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-colors group">
              <div className="relative">
                <img src={template.thumbnail} alt={template.title} className="w-full h-48 object-cover" />
                {template.isPremium && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <StarIcon className="h-3 w-3" />
                      <span>PRO</span>
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                  {template.duration}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
                      <PlayIcon className="h-6 w-6" />
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
                      <DocumentDuplicateIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{template.title}</h3>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{template.description}</p>
                
                {/* Rating and Uses */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-slate-300">{template.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <PlayIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{template.uses.toLocaleString()} uses</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 2 && (
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs">
                      +{template.tags.length - 2}
                    </span>
                  )}
                </div>
                
                {/* Creator and Category */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span>by {template.createdBy}</span>
                  <span className="capitalize">{template.category}</span>
                </div>
                
                {/* Use Template Button */}
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedTemplates.length === 0 && (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Browse our collection of professional video templates'
              }
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300">
              View All Templates
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
