import type { Chump } from "@/content.config";

export function enrichChumpData(chumpData: Chump[]): Chump[] {
  chumpData = chumpData.sort((a, b) => {
    return (
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      b.date_chump - a.date_chump
    );
  });
  // perform a lag and lead difference the ccurrent chump date and the previous chump date
  for (let i = 0; i < chumpData.length; i++) {
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const chump = chumpData[i].date;
    const chumpAfter = i === 0 ? today : chumpData[i - 1].date;
    const streak = calculateStreak(chump, chumpAfter);
    const localisedDate = chumpData[i].date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const dateBasic = chumpData[i].date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    chumpData[i] = {
      ...chumpData[i],
      ...{
        id: chumpData[i].name_slug,
        streak,
        localisedDate,
        dateBasic,
      },
    };
  }

  const stats = calculateChumpStatistics(chumpData);
  chumpData.forEach(chump => {
    chump.streak_max_proportion = chump.streak / stats.max;
  });
  return chumpData;
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

// export async function getNewestChump(): Promise<Chump> {
//     let rawChumps = await getCollection("chumps");
//     let enrichedChumps = enrichChumpData(rawChumps);
//     return enrichedChumps[0];
// }

// export async function getChumps(): Promise<Chump[]> {
//     let rawChumps = await getCollection("chumps");
//     return enrichChumpData(rawChumps);
// }

// calculate statistics for the chumps, i.e. average, median, max, min or streaks
// also calculate the normal distribution of the streaks for use in the histogram
export function calculateChumpStatistics(chumps: Chump[]): any {
  const streaks = chumps.map(chump => chump.streak);
  const average = calculateAverage(streaks);
  const median = calculateMedian(streaks);
  const max = getMaxValue(streaks);
  const min = getMinValue(streaks);
  const normalDistribution = calculateNormalDistribution(streaks);
  return {
    average,
    median,
    max,
    min,
    normalDistribution,
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

// export function calculateStreakFromStrings(chumpAfter: string, currentDate: string): number {
//     const prevDate = new Date(chumpAfter);
//     const currDate = new Date(currentDate);
//     const timeDiff = Math.abs(currDate.getTime() - prevDate.getTime());
//     return Math.floor(timeDiff / (1000 * 3600 * 24)); // Difference in days
//   }
