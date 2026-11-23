"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { VicksStoryViewer } from "./VicksStoryViewer";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { MOCK_STORIES } from "@/app/lib/mock-data";

interface Story {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerImage: string;
  seller: string;
  image: string;
  isGold: boolean;
  expiresAt: number;
  phone: string | null;
  telegram: string | null;
}

export function VicksStoriesBar() {
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);

  const fetchStories = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setStories(MOCK_STORIES as any);
      return;
    }

    const now = Date.now();
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        sellerId,
        sellerName,
        sellerImage,
        image,
        isGold,
        expiresAt,
        users!stories_sellerId_fkey (phone, telegram)
      `)
      .gt("expiresAt", now)
      .order("expiresAt", { ascending: true });

    if (error || !data || data.length === 0) {
      setStories(MOCK_STORIES as any);
      return;
    }

    const mapped: Story[] = data.map((s: any) => ({
      id: s.id,
      sellerId: s.sellerId,
      sellerName: s.sellerName,
      sellerImage: s.sellerImage || `https://picsum.photos/seed/${s.sellerId}/200/200`,
      seller: s.sellerName,
      image: s.image,
      isGold: s.isGold ?? false,
      expiresAt: s.expiresAt,
      phone: s.users?.phone ?? null,
      telegram: s.users?.telegram ?? null,
    }));

    setStories(mapped);
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vicks_viewed_stories") || "[]");
    setViewedStories(saved);
  }, []);

  const handleStoryClick = (story: Story) => {
    setActiveStory(story);
    if (!viewedStories.includes(story.id)) {
      const newList = [...viewedStories, story.id];
      setViewedStories(newList);
      localStorage.setItem("vicks_viewed_stories", JSON.stringify(newList));
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A2332] py-3 border-b dark:border-slate-800">
      <ScrollArea className="w-full whitespace-nowrap" dir="rtl">
        <div className="flex px-3 gap-3">
          {stories.map((story) => {
            const isViewed = viewedStories.includes(story.id);
            return (
              <div
                key={story.id}
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={() => handleStoryClick(story)}
              >
                <div className={cn(
                  "p-[2.5px] rounded-full transition-all duration-300",
                  isViewed
                    ? "bg-slate-200 dark:bg-slate-700"
                    : "bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-400 group-hover:scale-105"
                )}>
                  <div className="w-[58px] h-[58px] rounded-full bg-white dark:bg-[#1A2332] p-[2px]">
                    <img
                      src={story.sellerImage}
                      alt={story.seller}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[9px] font-black dark:text-slate-200 truncate w-[62px] text-center">
                  {story.seller}
                </span>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
      </ScrollArea>

      {activeStory && (
        <VicksStoryViewer
          story={activeStory}
          isOpen={!!activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </div>
  );
}
