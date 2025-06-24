import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
}

export const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Science Behind Viral Videos: What Makes Content Go Viral in 2024',
      excerpt: 'Our AI analyzed 50 million viral videos to uncover the exact patterns that trigger massive engagement. Here are the 7 key factors that determine virality.',
      content: 'After analyzing over 50 million viral videos across TikTok, Instagram, and YouTube, our AI has identified the core patterns that separate viral content from the billions of videos that get ignored...',
      author: 'Sarah Chen',
      date: '2024-12-20',
      readTime: '8 min read',
      category: 'AI Insights',
      tags: ['viral', 'AI', 'analytics', 'strategy'],
      image: '🧠'
    },
    {
      id: '2',
      title: 'From 200 to 2M Views: How AI Transformed This Creator\'s Channel',
      excerpt: 'Meet Jake Martinez, who went from struggling with 200-view videos to consistently hitting 2M+ views using AI-powered content optimization.',
      content: 'Jake Martinez was ready to quit content creation. After 18 months of grinding, his videos barely cracked 200 views. Then he discovered AI-powered video optimization...',
      author: 'Alex Johnson',
      date: '2024-12-18',
      readTime: '6 min read',
      category: 'Success Stories',
      tags: ['case-study', 'growth', 'creator-economy'],
      image: '📈'
    },
    {
      id: '3',
      title: 'The $500K Content Strategy: How to Monetize Viral Clips',
      excerpt: 'A complete breakdown of how successful creators turn viral moments into sustainable income streams worth hundreds of thousands.',
      content: 'Virality without monetization is just vanity metrics. Here\'s the exact framework top creators use to convert viral clips into serious revenue...',
      author: 'Marcus Rodriguez',
      date: '2024-12-15',
      readTime: '12 min read',
      category: 'Monetization',
      tags: ['monetization', 'strategy', 'business'],
      image: '💰'
    },
    {
      id: '4',
      title: 'Platform Algorithm Updates: What Changed in Q4 2024',
      excerpt: 'TikTok, Instagram, and YouTube all made major algorithm changes. Here\'s how to adapt your content strategy to maintain reach.',
      content: 'The social media landscape shifted dramatically in Q4 2024. TikTok prioritized longer-form content, Instagram boosted Reels with original audio, and YouTube Shorts introduced new ranking factors...',
      author: 'Dr. Emily Watson',
      date: '2024-12-12',
      readTime: '10 min read',
      category: 'Platform Updates',
      tags: ['algorithms', 'platforms', 'updates'],
      image: '🔄'
    },
    {
      id: '5',
      title: 'AI vs Human Editors: The Ultimate Speed and Quality Comparison',
      excerpt: 'We conducted a comprehensive study comparing AI-generated clips with professional human editors. The results will surprise you.',
      content: 'Can AI really match the creativity and intuition of human video editors? We ran a comprehensive 30-day study with 100 creators to find out...',
      author: 'Tech Research Team',
      date: '2024-12-10',
      readTime: '15 min read',
      category: 'Research',
      tags: ['AI', 'editing', 'comparison', 'research'],
      image: '⚡'
    },
    {
      id: '6',
      title: 'The Psychology of Hook Creation: First 3 Seconds That Change Everything',
      excerpt: 'Neuroscience research reveals exactly what happens in viewers\' brains during the first 3 seconds of a video. Use this to craft irresistible hooks.',
      content: 'Neuroscientists at Stanford University studied brain activity during video consumption. Their findings reveal the exact psychological triggers that determine whether someone keeps watching...',
      author: 'Dr. Michael Chang',
      date: '2024-12-08',
      readTime: '9 min read',
      category: 'Psychology',
      tags: ['psychology', 'hooks', 'neuroscience', 'retention'],
      image: '🧪'
    }
  ];

  const categories = ['all', 'AI Insights', 'Success Stories', 'Monetization', 'Platform Updates', 'Research', 'Psychology'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Creator <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Deep insights, proven strategies, and cutting-edge research to help you master 
              the art and science of viral content creation.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {category === 'all' ? 'All Articles' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Article */}
          {filteredPosts.length > 0 && (
            <div className="mb-16">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-8 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{filteredPosts[0].image}</span>
                  <div>
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">Featured</span>
                    <span className="ml-3 text-purple-400 text-sm">{filteredPosts[0].category}</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{filteredPosts[0].title}</h2>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">{filteredPosts[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>By {filteredPosts[0].author}</span>
                    <span>•</span>
                    <span>{filteredPosts[0].date}</span>
                    <span>•</span>
                    <span>{filteredPosts[0].readTime}</span>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Read Article
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{post.image}</span>
                    <span className="text-purple-400 text-sm font-medium">{post.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span>{post.date}</span>
                  </div>
                </div>
                
                <div className="px-6 pb-6">
                  <button className="w-full bg-slate-700 hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition-colors">
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Articles Found</h3>
              <p className="text-gray-300 mb-6">
                Try adjusting your search terms or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stay Ahead of the <span className="text-purple-400">Curve</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get weekly insights on viral trends, AI breakthroughs, and proven strategies 
            delivered straight to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-bold transition-all">
              Subscribe
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            Join 50,000+ creators. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}; 