export const generateLocationTemplate = (id, name, coordinates) => {
  return {
    id,
    name: {
      current: name,
      historical: []
    },
    location: {
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      address: {
        current: ""
      }
    },
    timeframes: [
      {
        period: "",
        significance: "",
        keyEvents: [
          {
            date: "",
            event: ""
          }
        ]
      }
    ],
    content: {
      summary: "",
      stories: []
    }
  };
};

export const generateStoryMarkdown = (title, author, location) => {
  const today = new Date().toISOString().split('T')[0];
  
  return `---
title: "${title}"
author: "${author}"
date: "${today}"
location: "${location}"
tags: []
---

# ${title}

[Brief introduction about what makes this place significant]

## Historical Background

[Describe the key historical context]

## Key Features

[List and describe important features visitors can see today]

## Historical Events

[Outline significant events that occurred here]

## What to Look For

[Tell visitors what they can observe at the site today]
`;
};

export const generateConnectionsTemplate = (id, locationType = "historical") => {
  return {
    id,
    type: locationType,
    connections: {
      locations: [
        {
          id: "",
          relationship: "primary",
          coordinates: {
            lat: 0,
            lng: 0
          },
          relevantFeatures: []
        }
      ],
      timePeriods: [
        {
          period: "",
          importance: "primary",
          events: [
            {
              date: "",
              description: ""
            }
          ]
        }
      ],
      relatedStories: [],
      themes: []
    }
  };
};