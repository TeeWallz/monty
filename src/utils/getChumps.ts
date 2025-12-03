// getChumps.ts
import { z, getCollection } from "astro:content";
import fs from "fs";
import path from "path";
import { date } from "astro/zod";

export interface EventMedia {
  caption: string;
  ismain: boolean;
  image: string;
  body: string;
}

export interface event {
  title: string;
  date: Date;
  event_type: string;
  slug: string;
  thanks: string; 
  media: EventMedia[];
  days_since_last_chump?: number;
  streak_rank?: number; // New field for streak ranking
  same_day_order?: number;
}

// Helper function to calculate streak
// function calculateStreak(date1: Date, date2: Date): number {
//   const oneDay = 24 * 60 * 60 * 1000;
//   const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
//   return diffDays;
// }

export async function getEventsData(): Promise<event[]> {
  let raw = await getCollection("events");

  // filter out Era events for now
  raw = raw.filter(evt => evt.data.event_type !== "Era");

  let events: event[] = raw.map((e) => {
    const rawMedia = e.data.media ?? [];
    if(e.slug === "2025-10-16_fetch-and-forget") {
      console.log("Raw media for fetch-and-forget:", rawMedia);
    }
    const media: EventMedia[] = rawMedia.map((m: any) => {
      return {
        caption: m?.caption ?? "",
        ismain: m?.ismain ?? false,
        image: m?.image ?? "",
        body: m?.body ?? "",
      };
    });

    return {
      title: e.data.title ?? "",
      date: e.data.date ?? new Date(0),
      event_type: e.data.event_type ?? "",
      slug: e.slug,
      thanks: e.data.thanks ?? "",
      media,
    };
  });
  
  events = events.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate days_since_last_chump for chump events
  // First, sort events from OLDEST to NEWEST for streak calculation
  const chronologicalEvents = [...events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const chumpStreaks: number[] = [];
  
  // Find all chumps in chronological order
  const chumpsInOrder = chronologicalEvents.filter(evt => evt.event_type === "Chump");
  
  // Process chumps from oldest to newest
  for (let i = 0; i < chumpsInOrder.length; i++) {
    const currentChump = chumpsInOrder[i];
    let differenceInDays: number | undefined = undefined;
    
    if (i === 0) {
      // First chump (oldest) - no streak
      differenceInDays = undefined;
    } else {
      // Calculate days between this chump and the previous one
      const previousChump = chumpsInOrder[i - 1];
      differenceInDays = calculateStreak(currentChump.date, previousChump.date);
      
      // Add to streaks array for ranking (only if we have a valid streak)
      if (differenceInDays !== null) {
        chumpStreaks.push(differenceInDays);
      }
    }
    
    // Update the original events array
    const originalIndex = events.findIndex(e => e.slug === currentChump.slug);
    if (originalIndex !== -1) {
      events[originalIndex].days_since_last_chump = differenceInDays;
    }

    // Also set same_day_order for events on the same day, sorted by time
    const sameDayEvents = events.filter(e => {
      return e.date.toDateString() === currentChump.date.toDateString() && e.event_type === "Chump";
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    sameDayEvents.forEach((evt, index) => {
      const idx = events.findIndex(e => e.slug === evt.slug);
      if (idx !== -1) {
        events[idx].same_day_order = index + 1; // 1-based order
      }
    });
  }
  
  // Calculate days since the MOST RECENT chump (from today)
  if (chumpsInOrder.length > 0) {
    const mostRecentChump = chumpsInOrder[chumpsInOrder.length - 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mostRecentDate = new Date(mostRecentChump.date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const daysSinceMostRecent = calculateStreak(mostRecentDate, today);
    
    // Update the original events array
    const originalIndex = events.findIndex(e => e.slug === mostRecentChump.slug);
    if (originalIndex !== -1) {
      // Overwrite with days from today for the most recent chump
      events[originalIndex].days_since_last_chump = daysSinceMostRecent;
      
      // Add this to streaks array as well
      chumpStreaks.push(daysSinceMostRecent);
    }
  }

  // Sort streaks in descending order to get rankings
  const sortedStreaks = [...chumpStreaks].sort((a, b) => b - a);
  
  // Assign rankings to events
  for (let i = 0; i < events.length; i++) {
    if (events[i].event_type === "Chump" && events[i].days_since_last_chump !== null && events[i].days_since_last_chump !== undefined) {
      const rank = sortedStreaks.indexOf(events[i].days_since_last_chump!) + 1;
      events[i].streak_rank = rank;
    }
  }
  
  return events;
}

// Helper function to calculate streak
function calculateStreak(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
}


interface EventsGroupedByYearMonthValue {
  events: event[];
  era: string;
}

export interface EventsGroupedByYearMonth {
  [year: number]: {
    [month: string]: EventsGroupedByYearMonthValue;
  };
}

export async function getEventsDataGroupedByYearMonth(): Promise<EventsGroupedByYearMonth> {
  const events = await getEventsData();

  // Filter out Era events if you want them separate
  const nonEraEvents = events.filter(evt => evt.event_type !== "Era");
  const eraEvents = events.filter(evt => evt.event_type === "Era");

  // Ensure newest first
  nonEraEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const eventsByYearMonth: Record<number, Record<string, event[]>> = {};
  events.forEach(evt => {
    const year = evt.date.getFullYear();
    const month = evt.date.toLocaleString("default", { month: "long" });
    if (!eventsByYearMonth[year]) eventsByYearMonth[year] = {};
    if (!eventsByYearMonth[year][month]) eventsByYearMonth[year][month] = [];
    // Pushing in already-sorted order keeps newest first within each month
    eventsByYearMonth[year][month].push(evt);
  });

  return eventsByYearMonth;
}

// Helper function to get streak class
export function getStreakClass(rank?: number): string {
  if (!rank) return "streak-badge";
  
  if (rank === 1) {
    return "streak-badge streak-record";
  } else if (rank <= 3) {
    return "streak-badge streak-top-3";
  } else if (rank <= 10) {
    return "streak-badge streak-top-10";
  }
  return "streak-badge";
}

// Helper function to get streak label
export function getStreakLabel(streak?: number, rank?: number): string {
  if (!streak) return "";
  if (!streak || streak === 0) return "Same day event!"; // Handle 0 days
  
  let label = `Streak of ${streak} days`;
  
  if (rank === 1) {
    label += ` \u{1F3C6} #1 Record Streak!`;
  } else if (rank === 2) {
    label += ` \u{1F948} #2 Best Streak`;
  } else if (rank === 3) {
    label += ` \u{1F949} #3 Best Streak`;
  } else if (rank && rank <= 10) {
    label += ` \u{1F3C5} #${rank} Top 10 Streak`;
  }
  
  return label;
}

export async function getChumpData(): Promise<ChumpData> {
  let chumps: Chump[] = await getCollection("chumps");
  return enrichChumpData(chumps);
}

export async function enrichChumpData(chumps: Chump[]): Promise<ChumpData> {
  chumps = chumps.sort((a, b) => {
    return (
      new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
  });
  // perform a lag and lead difference the ccurrent chump date and the previous chump date
  for (let i = 0; i < chumps.length; i++) {
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const chump = chumps[i].data.date;
    const chumpAfter = i === 0 ? today : chumps[i - 1].data.date;
    const streak = calculateStreak(chump, chumpAfter);
    const localisedDate = chumps[i].data.date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const dateBasic = chumps[i].data.date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    chumps[i].data.streak = streak;
    chumps[i].data.localisedDate = localisedDate;
    chumps[i].data.dateBasic = dateBasic;
  }

  const stats = calculateChumpStatistics(chumps);
  chumps.forEach(chump => {
    chump.data.streak_max_proportion = chump.data.streak / stats.max;
  });

  const chumpsByYearMap: Map<number, Chump[]> = chumps.reduce((acc, chump) => {
    const year = chump.data.date.getFullYear();
    if (!acc.has(year)) {
      acc.set(year, []);
    }
    acc.get(year)!.push(chump);
    return acc;
  }, new Map<number, any[]>());

  const chumpsByYear = Array.from(chumpsByYearMap).map(([year, chumps]) => {
    return {
      year,
      chumps,
    };
  });

  const chumpsByYearWeek = {};
  chumps.forEach(chump => {
    const date = chump.data.date;
    const year = date.getFullYear();
    const week = Math.ceil(
      (date.getTime() - new Date(year, 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    if (!chumpsByYearWeek[year]) {
      chumpsByYearWeek[year] = {};
    }
    if (!chumpsByYearWeek[year][week]) {
      chumpsByYearWeek[year][week] = [];
    }
    chumpsByYearWeek[year][week].push(chump);
  });

  return { chumps, stats, chumpsByYear, chumpsByYearMap, chumpsByYearWeek };
}

export function calculateStreakFromStrings(
  chumpAfter: string,
  currentDate: string
): number {
  const prevDate = new Date(chumpAfter);
  const currDate = new Date(currentDate);
  const timeDiff = Math.abs(currDate.getTime() - prevDate.getTime());
  return Math.floor(timeDiff / (1000 * 3600 * 24)); // Difference in days
}

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

export function calculateChumpStatistics(chumps: Chump[]): any {
  const streaks = chumps.map(chump => chump.data.streak);
  const average = calculateAverage(streaks);
  const median = calculateMedian(streaks);
  const max = getMaxValue(streaks);
  const min = getMinValue(streaks);
  const normalDistribution = calculateNormalDistribution(streaks);

  const averageExpectingGateDays = 7;
  let streakStatus = "";
  if (chumps[0].data.streak <= 20) {
    streakStatus = "Recent loss against Monty Balboa";
  } else if (
    Math.abs(chumps[0].data.streak - average) <= averageExpectingGateDays
  ) {
    streakStatus = "Expecting soon!";
  } else if (chumps[0].data.streak - average >= 14) {
    streakStatus = "WAAAAY overdue!!";
  } else if (chumps[0].data.streak - average >= 7) {
    streakStatus = "Overdue";
  } else {
    streakStatus = "Not expecting";
  }

  return {
    average,
    median,
    max,
    min,
    normalDistribution,
    streakStatus,
  };
}

export function calculateNormalDistribution(numbers: number[]): any {
  const mean = calculateAverage(numbers);
  const variance = calculateVariance(numbers, mean);
  const standardDeviation = Math.sqrt(variance);
  const normalDistribution = numbers.map(num => {
    return {
      x: num,
      y: calculateNormalDistributionValue(num, mean, standardDeviation),
    };
  });
  return normalDistribution;
}

export function calculateVariance(numbers: number[], mean: number): number {
  return calculateAverage(numbers.map(num => Math.pow(num - mean, 2)));
}

export function calculateNormalDistributionValue(
  x: number,
  mean: number,
  standardDeviation: number
): number {
  return (
    (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) *
    Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(standardDeviation, 2)))
  );
}

export function getMaxValue(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
}

export function getMinValue(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  // Sort the numbers in ascending order
  numbers.sort((a, b) => a - b);

  const middle = Math.floor(numbers.length / 2);
  // If odd length, return the middle value
  if (numbers.length % 2 !== 0) {
    return numbers[middle];
  }
  // If even length, return the average of the two middle values
  return (numbers[middle - 1] + numbers[middle]) / 2;
}
