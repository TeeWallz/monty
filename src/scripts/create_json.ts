import fs from 'fs';
import path from 'path';
import { getChumpJson } from '../utils/chumpUtils';

// Get current year for the final era
const currentYear = new Date().getFullYear();
const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Define our eras with more poetic names
const ERAS = [
  {
    start_date: { year: "2016", month: "01" },
    end_date: { year: "2018", month: "12" },
    text: {
      headline: "Humble Beginnings",
      text: "The early days when the bridge first gained notoriety"
    }
  },
  {
    start_date: { year: "2019", month: "01" },
    end_date: { year: "2019", month: "12" },
    text: {
      headline: "The Great Silence",
      text: "A mysterious lull in bridge strikes - perhaps drivers were learning?"
    }
  },
  {
    start_date: { year: "2020", month: "01" },
    end_date: { year: "2022", month: "12" },
    text: {
      headline: "Pandemic Pandemonium",
      text: "COVID years brought unexpected challenges... and bridge strikes"
    }
  },
  {
    start_date: { year: "2023", month: "01" },
    end_date: { year: "2025", month: "06" },
    text: {
      headline: "The Resurgence",
      text: "Post-COVID, the bridge reclaimed its throne as Melbourne's most notorious"
    }
  },
  {
    start_date: { year: "2025", month: "07" },
    end_date: { year: currentYear.toString(), month: "12", day: "31" },
    text: {
      headline: "The Speed Limit Era",
      text: "Will the new 40km/h limit finally solve the problem?"
    }
  }
];

// Define special events that aren't strikes
const SPECIAL_EVENTS = [
  {
    start_date: { year: "2016", month: "05", day: "19" },
    text: {
      headline: "The Gantry Arrives",
      text: "Warning gantry installed to alert drivers of the low clearance"
    },
    background: {
      color: "#4a6da7"
    },
    group: "infrastructure"
  },
  {
    start_date: { year: "2025", month: "06", day: "30" },
    text: {
      headline: "Speed Limit Reduced",
      text: "Speed limit lowered to 40km/h near the bridge"
    },
    background: {
      color: "#8e44ad"
    },
    group: "regulation"
  }
];

async function convertChumpsToTimeline() {
  const chumpsJson = await getChumpJson();
  const chumps = JSON.parse(chumpsJson);

  // Sort chumps by date (newest first in original data, we need oldest first)
  const sortedChumps = [...chumps].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Create events with date ranges
  const strikeEvents = sortedChumps.map((chump, index) => {
    const dateParts = chump.date.split('-');
    const startDate = {
      year: dateParts[0],
      month: dateParts[1],
      day: dateParts[2]
    };

    // Calculate end date (next strike's date or current date if last strike)
    let endDate;
    if (index < sortedChumps.length - 1) {
      const nextDateParts = sortedChumps[index + 1].date.split('-');
      endDate = {
        year: nextDateParts[0],
        month: nextDateParts[1],
        day: nextDateParts[2]
      };
    } else {
      // For the most recent strike, end date is today
      const todayParts = currentDate.split('-');
      endDate = {
        year: todayParts[0],
        month: todayParts[1],
        day: todayParts[2]
      };
    }

    // Calculate duration in days
    const start = new Date(chump.date);
    const end = new Date(
      endDate.year,
      endDate.month - 1,
      endDate.day
    );
    const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));

    return {
      start_date: startDate,
      end_date: endDate,
      media: {
        link: chump.url !== '#' ? chump.url : undefined,
        thumbnail: chump.image
      },
      text: {
        headline: `<a href='${chump.url}'>${chump.name}</a>`,
        text: `Strike occurred on ${chump.localisedDate}. Held the record for ${durationDays} days.`
      },
      background: {
        url: chump.image
      },
      group: "strikes"
    };
  });

  const timeline = {
    title: {
      text: {
        headline: "The Saga of Montague Street Bridge",
        text: "A chronicle of Melbourne's most infamous bridge and its ongoing battle with vehicles"
      },
      media: {
        url: "assets/header.jpg",
        caption: "Montague Street Bridge"
      }
    },
    eras: ERAS,
    events: [
      // First add special events
      ...SPECIAL_EVENTS,
      // Then add all the strike events with date ranges
      ...strikeEvents
    ]
  };

  // Clean up undefined values
  timeline.events.forEach(event => {
    if (event.media && !event.media.link) {
      delete event.media.link;
    }
  });

  const outputPath = path.join(process.cwd(), 'public/timeline.json');
  fs.writeFileSync(outputPath, JSON.stringify(timeline, null, 2));
  console.log(`Timeline data written to ${outputPath}`);
}

convertChumpsToTimeline().catch(console.error);