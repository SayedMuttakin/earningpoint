import React from 'react';
import { Plus, Music } from 'lucide-react';
import { getImageUrl } from '../../config';

const StoryTray = ({
  stories = [],
  currentUser = null,
  onOpenCreator,
  onOpenViewer,
}) => {
  const myStoryUser = stories.find(
    s => s._id?.toString() === currentUser?._id?.toString()
  );
  const otherStories = stories.filter(
    s => s._id?.toString() !== currentUser?._id?.toString()
  );

  const getAvatarUrl = (pic) => {
    return getImageUrl(pic);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto py-2 px-1 scrollbar-none snap-x">
        
        {/* ── CARD 1: CREATE STORY (Facebook Style) ── */}
        <div
          onClick={() => {
            if (myStoryUser && myStoryUser.stories?.length > 0) {
              onOpenViewer(myStoryUser, 0);
            } else {
              onOpenCreator();
            }
          }}
          className="aspect-[9/16] w-24 sm:w-28 rounded-2xl overflow-hidden shrink-0 snap-start relative group cursor-pointer border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all active:scale-[0.98] select-none"
        >
          {/* Top 65% photo */}
          <div className="h-[65%] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
            {myStoryUser?.stories?.[0]?.image ? (
              <img
                src={getImageUrl(myStoryUser.stories[0].image)}
                alt="My Story"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : currentUser?.profilePic ? (
              <img
                src={getAvatarUrl(currentUser.profilePic)}
                alt={currentUser.name || 'User'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

            {/* If user already has active story, show rainbow border on photo */}
            {myStoryUser && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#7C3AED]/90 backdrop-blur-xs text-[9px] font-black text-white uppercase tracking-wider shadow">
                Your Story
              </div>
            )}
          </div>

          {/* Overlapping Plus button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreator();
            }}
            title="Create Story"
            className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center border-[3px] border-white dark:border-slate-900 shadow-md group-hover:scale-110 transition-transform active:scale-95 z-10"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
          </button>

          {/* Bottom 35% label */}
          <div className="h-[35%] w-full flex flex-col items-center justify-end pb-2 pt-3 px-1 text-center bg-white dark:bg-slate-900">
            <span className="text-[11px] font-black text-slate-850 dark:text-slate-100 leading-tight truncate w-full">
              {myStoryUser ? 'Add / View' : 'Create Story'}
            </span>
          </div>
        </div>

        {/* ── FRIENDS & COMMUNITY STORIES ── */}
        {otherStories.map((storyUser) => {
          const latestStory = storyUser.stories[storyUser.stories.length - 1];
          const hasImage = !!latestStory?.image;
          const hasMusic = !!latestStory?.music?.url;

          return (
            <div
              key={storyUser._id}
              onClick={() => onOpenViewer(storyUser, 0)}
              className="aspect-[9/16] w-24 sm:w-28 rounded-2xl overflow-hidden shrink-0 snap-start relative group cursor-pointer border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all active:scale-[0.98] select-none"
              style={
                !hasImage
                  ? { background: latestStory?.bgGradient || 'linear-gradient(135deg, #7C3AED, #2563EB)' }
                  : {}
              }
            >
              {/* Full-bleed Story image */}
              {hasImage ? (
                <img
                  src={getImageUrl(latestStory.image)}
                  alt={storyUser.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                /* Text/Emoji preview when no image */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                  {latestStory?.emoji && (
                    <span className="text-2xl drop-shadow mb-1">{latestStory.emoji}</span>
                  )}
                  {latestStory?.text && (
                    <p
                      className="text-[10px] font-black text-white leading-tight line-clamp-3 drop-shadow"
                      style={{ color: latestStory.textColor || '#ffffff' }}
                    >
                      {latestStory.text}
                    </p>
                  )}
                </div>
              )}

              {/* Gradient overlays for contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

              {/* Top-left User Avatar with Instagram/FB gradient ring */}
              <div className="absolute top-2 left-2 z-10">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md">
                  <div className="p-[1.5px] bg-white dark:bg-slate-900 rounded-full">
                    {storyUser.profilePic ? (
                      <img
                        src={getAvatarUrl(storyUser.profilePic)}
                        alt={storyUser.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black">
                        {storyUser.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top-right Music Badge if story contains music */}
              {hasMusic && (
                <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-black/50 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow">
                  <Music className="w-2.5 h-2.5 animate-pulse text-amber-300" />
                </div>
              )}

              {/* Bottom user name */}
              <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
                <p className="text-[11px] font-black text-white leading-tight truncate drop-shadow-md">
                  {storyUser.name?.split(' ')[0] || 'User'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryTray;
