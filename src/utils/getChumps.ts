import { z, getCollection } from "astro:content";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { date } from "astro/zod";

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

// above, but accepting Date objects
export function calculateStreak(chump: Date, chumpAfter: Date): number {
  const timeDiff = Math.abs(chumpAfter.getTime() - chump.getTime());
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
