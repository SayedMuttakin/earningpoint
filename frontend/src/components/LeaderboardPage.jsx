import React, { useState } from 'react';
import { ChevronLeft, Crown, Zap } from 'lucide-react';
import PullToRefresh from './PullToRefresh';

const MOCK_DATA = [
  { id: 1, name: 'Jordyn Kenter', score: 96239, avatar: 'https://i.pravatar.cc/150?u=12', rank: 1 },
  { id: 2, name: 'Alena Bator', score: 84787, avatar: 'https://i.pravatar.cc/150?u=24', rank: 2 },
  { id: 3, name: 'Carl Oliver', score: 82139, avatar: 'https://i.pravatar.cc/150?u=35', rank: 3 },
  { id: 4, name: 'Davis Curtis', score: 80857, avatar: 'https://i.pravatar.cc/150?u=41', rank: 4 },
  { id: 5, name: 'Isona Othid', score: 76128, avatar: 'https://i.pravatar.cc/150?u=52', rank: 5 },
  { id: 6, name: 'Makenna George', score: 71667, avatar: 'https://i.pravatar.cc/150?u=69', rank: 6 },
  { id: 7, name: 'Kianna Batista', score: 68439, avatar: 'https://i.pravatar.cc/150?u=73', rank: 7 },
  { id: 8, name: 'Maxith Cullep', score: 66981, avatar: 'https://i.pravatar.cc/150?u=8', rank: 8 },
  { id: 9, name: 'Zain Dias', score: 50546, avatar: 'https://i.pravatar.cc/150?u=91', rank: 9 },
];

const LeaderboardPage = ({ onBack }) => {
  const [refreshing, setRefreshing] = useState(false);
  const top3 = MOCK_DATA.slice(0, 3);
  const rest = MOCK_DATA.slice(3);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Reorder for podium: 2nd, 1st, 3rd
  const podiumData = [top3[1], top3[0], top3[2]];

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <div className="w-full min-h-screen bg-slate-50 flex flex-col pb-24 font-sans">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors mr-4">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Leaderboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center max-w-6xl mx-auto">
          
          {/* Left Column: Podium designed for Desktop/Mobile hybrid */}
          <div className="w-full lg:w-1/2 flex justify-center order-1">
            <div className="w-full max-w-md">
              <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8 h-64 lg:h-80 mt-10 lg:mt-0">
                {podiumData.map((user, index) => {
                  const isFirst = index === 1;
                  const isSecond = index === 0;
                  const isThird = index === 2;
                  
                  let badgeColor = "text-slate-400";
                  let badgeBg = "bg-slate-100 border-slate-300 text-slate-600";
                  let bgClass = "bg-gradient-to-t from-slate-200/60 to-white/50 border-slate-200";
                  let rankText = "2nd";
                  
                  let heightClass = "h-[180px] lg:h-[250px]";
                  
                  if (isFirst) {
                    badgeColor = "text-yellow-500";
                    badgeBg = "bg-yellow-100 border-yellow-400 text-yellow-700";
                    bgClass = "bg-gradient-to-t from-yellow-100/80 to-white/50 border-yellow-200 shadow-xl shadow-yellow-100/50";
                    rankText = "1st";
                    heightClass = "h-[220px] lg:h-[300px]";
                  } else if (isThird) {
                    badgeColor = "text-orange-500";
                    badgeBg = "bg-orange-100 border-orange-400 text-orange-700";
                    bgClass = "bg-gradient-to-t from-orange-100/60 to-white/50 border-orange-200";
                    rankText = "3rd";
                    heightClass = "h-[150px] lg:h-[210px]";
                  }

                  return (
                    <div 
                      key={user.id} 
                      className={`relative flex flex-col items-center justify-end w-28 sm:w-32 lg:w-40 rounded-t-2xl lg:rounded-t-3xl border ${bgClass} pb-4 px-2 hover:-translate-y-2 transition-transform duration-300 ${heightClass}`}
                    >
                      <div className={`absolute -top-16 lg:-top-20 flex flex-col items-center`}>
                        {/* Rank Badge */}
                        <div className="flex flex-col items-center mb-2 lg:mb-4">
                           {isFirst && <Crown className={`w-6 h-6 lg:w-8 lg:h-8 ${badgeColor} -mb-1 lg:-mb-2 drop-shadow-sm`} />}
                           <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full border text-xs lg:text-sm font-bold ${badgeBg}`}>
                             {rankText}
                           </span>
                        </div>

                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover shadow-inner" />
                        </div>
                      </div>
                      
                      <div className="text-center mt-auto w-full">
                        <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-800 truncate px-1">{user.name}</p>
                        <div className="flex items-center justify-center gap-1 mt-1 lg:mt-2 text-emerald-600 font-bold bg-emerald-50 max-w-[90%] mx-auto py-1 lg:py-1.5 rounded-lg border border-emerald-100">
                          <Zap className="w-3 h-3 lg:w-4 lg:h-4 fill-current drop-shadow-sm" />
                          <span className="text-xs sm:text-sm lg:text-base">{user.score.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: List Section for Desktop, stacked on Mobile */}
          <div className="w-full lg:w-1/2 order-2">
            <div 
              className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden animate-fade-in-up"
            >
              <div className="px-5 lg:px-8 py-4 lg:py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <p className="text-sm lg:text-base font-bold text-slate-600 uppercase tracking-widest">Global Top Earners</p>
                <div className="text-xs font-semibold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Updated Today</div>
              </div>
              
              <div className="divide-y divide-slate-50/80">
                {rest.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 lg:p-6 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="relative">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-transparent group-hover:border-emerald-100 transition-colors shadow-sm">
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm lg:text-base font-bold text-slate-800">{user.name}</h3>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm lg:text-base mt-0.5">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{user.score.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm lg:text-base bg-white shadow-sm group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors">
                      {user.rank}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      </div>
    </PullToRefresh>
  );
};

export default LeaderboardPage;
