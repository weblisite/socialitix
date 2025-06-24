import React, { useState } from 'react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  videoUrl: string;
  steps: string[];
  tools: string[];
  thumbnail: string;
  completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  tutorialCount: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  tutorials: string[];
}

export const Tutorials: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState<'tutorials' | 'courses'>('tutorials');
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Creating Your First Viral Hook in 60 Seconds',
      description: 'Learn the exact formula for creating attention-grabbing hooks that stop the scroll and keep viewers watching.',
      duration: '12 min',
      difficulty: 'Beginner',
      category: 'Content Creation',
      videoUrl: 'https://example.com/tutorial1',
      steps: [
        'Identify your target emotion (curiosity, shock, excitement)',
        'Use the "Pattern Interrupt" technique',
        'Add a compelling visual element',
        'Include a clear value proposition',
        'Test and iterate based on performance'
      ],
      tools: ['Socialitix AI', 'Video Editor', 'Analytics Dashboard'],
      thumbnail: '🎯'
    },
    {
      id: '2',
      title: 'AI-Powered Clip Generation: From Long-Form to Viral Shorts',
      description: 'Master the art of using AI to automatically identify and extract the most engaging moments from your long-form content.',
      duration: '18 min',
      difficulty: 'Intermediate',
      category: 'AI Tools',
      videoUrl: 'https://example.com/tutorial2',
      steps: [
        'Upload your long-form video to Socialitix',
        'Configure AI detection settings',
        'Review AI-suggested clips',
        'Customize clips with trending elements',
        'Export and optimize for each platform'
      ],
      tools: ['Socialitix AI', 'Trend Analyzer', 'Multi-Platform Optimizer'],
      thumbnail: '🤖'
    },
    {
      id: '3',
      title: 'Platform-Specific Optimization: TikTok vs Instagram vs YouTube',
      description: 'Understand the unique algorithm preferences of each platform and optimize your content accordingly.',
      duration: '25 min',
      difficulty: 'Advanced',
      category: 'Platform Strategy',
      videoUrl: 'https://example.com/tutorial3',
      steps: [
        'Analyze platform-specific engagement patterns',
        'Adapt content format for each platform',
        'Optimize posting times and frequency',
        'Use platform-specific features and trends',
        'Cross-platform content strategy'
      ],
      tools: ['Platform Analytics', 'Scheduling Tools', 'Performance Tracker'],
      thumbnail: '📱'
    },
    {
      id: '4',
      title: 'Trend Hijacking: Riding the Wave of Viral Moments',
      description: 'Learn how to identify emerging trends early and create content that capitalizes on viral moments.',
      duration: '15 min',
      difficulty: 'Intermediate',
      category: 'Trend Analysis',
      videoUrl: 'https://example.com/tutorial4',
      steps: [
        'Set up trend monitoring alerts',
        'Analyze trend lifecycle patterns',
        'Create content that adds unique value',
        'Time your content release perfectly',
        'Measure and optimize performance'
      ],
      tools: ['Trend Monitor', 'Content Planner', 'Performance Analytics'],
      thumbnail: '🌊'
    },
    {
      id: '5',
      title: 'Advanced Analytics: Reading the Data That Matters',
      description: 'Go beyond vanity metrics to understand the data that actually drives growth and revenue.',
      duration: '22 min',
      difficulty: 'Advanced',
      category: 'Analytics',
      videoUrl: 'https://example.com/tutorial5',
      steps: [
        'Set up comprehensive tracking',
        'Identify key performance indicators',
        'Analyze audience behavior patterns',
        'Create actionable insights reports',
        'Make data-driven content decisions'
      ],
      tools: ['Analytics Dashboard', 'Data Visualization', 'Report Generator'],
      thumbnail: '📊'
    },
    {
      id: '6',
      title: 'Monetization Mastery: From Views to Revenue',
      description: 'Transform your viral content into sustainable income streams through strategic monetization.',
      duration: '28 min',
      difficulty: 'Advanced',
      category: 'Monetization',
      videoUrl: 'https://example.com/tutorial6',
      steps: [
        'Identify monetization opportunities',
        'Build audience trust and engagement',
        'Create compelling offers and CTAs',
        'Track conversion rates and ROI',
        'Scale successful monetization strategies'
      ],
      tools: ['Conversion Tracker', 'A/B Testing', 'Revenue Analytics'],
      thumbnail: '💰'
    }
  ];

  const courses: Course[] = [
    {
      id: '1',
      title: 'Complete Viral Content Mastery',
      description: 'A comprehensive course covering everything from content creation to monetization.',
      totalDuration: '4 hours',
      tutorialCount: 12,
      difficulty: 'Beginner',
      category: 'Complete Course',
      thumbnail: '🎓',
      tutorials: ['1', '2', '3', '4', '5', '6']
    },
    {
      id: '2',
      title: 'AI-Powered Creator Bootcamp',
      description: 'Master AI tools and automation to scale your content creation process.',
      totalDuration: '2.5 hours',
      tutorialCount: 8,
      difficulty: 'Intermediate',
      category: 'AI Specialization',
      thumbnail: '🚀',
      tutorials: ['2', '4', '5']
    },
    {
      id: '3',
      title: 'Revenue Generation Blueprint',
      description: 'Turn your content into a profitable business with proven monetization strategies.',
      totalDuration: '3 hours',
      tutorialCount: 10,
      difficulty: 'Advanced',
      category: 'Business',
      thumbnail: '💼',
      tutorials: ['5', '6']
    }
  ];

  const categories = ['all', 'Content Creation', 'AI Tools', 'Platform Strategy', 'Trend Analysis', 'Analytics', 'Monetization'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const toggleTutorialComplete = (tutorialId: string) => {
    const newCompleted = new Set(completedTutorials);
    if (newCompleted.has(tutorialId)) {
      newCompleted.delete(tutorialId);
    } else {
      newCompleted.add(tutorialId);
    }
    setCompletedTutorials(newCompleted);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Master <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Viral Content</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Step-by-step tutorials, expert courses, and hands-on training to transform 
              you into a viral content creation machine.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>50+ Expert Tutorials</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Interactive Learning</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Real-World Projects</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800 rounded-lg p-1 flex">
              <button
                onClick={() => setActiveTab('tutorials')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'tutorials'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Individual Tutorials
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'courses'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Complete Courses
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'tutorials' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{tutorial.thumbnail}</span>
                      <button
                        onClick={() => toggleTutorialComplete(tutorial.id)}
                        className={`p-2 rounded-full transition-colors ${
                          completedTutorials.has(tutorial.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </span>
                      <span className="text-purple-400 text-sm">{tutorial.category}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {tutorial.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {tutorial.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>⏱️ {tutorial.duration}</span>
                      <span>🛠️ {tutorial.tools.length} tools</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-300">What you'll learn:</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {tutorial.steps.slice(0, 3).map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-purple-400">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all">
                      Start Tutorial
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{course.thumbnail}</span>
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">Course</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                      <span className="text-purple-400 text-sm">{course.category}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {course.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{course.totalDuration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <span>{course.tutorialCount} tutorials</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Course Progress</h4>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full w-1/3"></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">2 of 6 tutorials completed</p>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all">
                      Continue Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {((activeTab === 'tutorials' && filteredTutorials.length === 0) || 
            (activeTab === 'courses' && filteredCourses.length === 0)) && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-4">No {activeTab} Found</h3>
              <p className="text-gray-300 mb-6">
                Try adjusting your filters to find the perfect learning content.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Learning Path Recommendation */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Not Sure Where to <span className="text-purple-400">Start?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Take our quick assessment to get a personalized learning path 
            tailored to your experience level and goals.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Beginner Path</h3>
              <p className="text-gray-300 text-sm">Start with fundamentals and build your foundation</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">Growth Path</h3>
              <p className="text-gray-300 text-sm">Scale your existing skills and optimize performance</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">Monetization Path</h3>
              <p className="text-gray-300 text-sm">Turn your content into sustainable revenue</p>
            </div>
          </div>
          
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all">
            Take Learning Assessment
          </button>
        </div>
      </section>
    </div>
  );
}; 