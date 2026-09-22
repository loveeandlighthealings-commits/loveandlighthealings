/**
 * The readings for each numerology number, ported exactly from
 * reference/prototype.html's NUM table.
 */
export interface NumerologyReading {
  name: string;
  keyword: string;
  /** Hex color associated with this number. */
  color: string;
  /** Human name for the color, e.g. "Coral red". */
  colorName: string;
  day: string;
  month: string;
  year: string;
  lifePath: string;
  good: string[];
  care: string[];
  affirmation: string;
}

export const NUMEROLOGY_CONTENT: Record<number, NumerologyReading> = {
  1: {
    name: "The Initiator",
    keyword: "Begin and lead",
    color: "#E9604F",
    colorName: "Coral red",
    day: "A day for fresh starts and taking the first step. Energy favours independence, decisions and putting yourself forward.",
    month: "A month to plant new seeds. Start what you have been postponing and trust your own direction.",
    year: "A new nine-year cycle begins. This is a year for new beginnings, courage and setting the tone for the years ahead.",
    lifePath: "Natural leaders and pioneers: independent, driven and original, learning to lead without going it alone.",
    good: ["Starting a project", "Making a decision", "Speaking up"],
    care: ["Impatience", "Doing everything alone"],
    affirmation: "I begin with confidence.",
  },
  2: {
    name: "The Peacemaker",
    keyword: "Partner and listen",
    color: "#F0A25C",
    colorName: "Apricot",
    day: "A gentle, cooperative day. Patience, listening and small kindnesses go further than force.",
    month: "A month for partnership, patience and details. Progress is quiet and steady, so let things unfold.",
    year: "A year of cooperation, relationships and patience. What you began last year needs nurturing rather than pushing.",
    lifePath: "Sensitive diplomats and supporters: intuitive, caring and gifted at bringing people together.",
    good: ["Teamwork", "Listening", "Quiet planning"],
    care: ["Oversensitivity", "Waiting too long to decide"],
    affirmation: "I move with patience and grace.",
  },
  3: {
    name: "The Communicator",
    keyword: "Express and enjoy",
    color: "#EBB43C",
    colorName: "Honey yellow",
    day: "A lively, sociable day. Creativity, conversation and lightness come easily.",
    month: "A month for self-expression, socialising and creative play. Share your ideas and lift your mood.",
    year: "A creative, social year. Expression, joy and connection are highlighted, so put your voice out there.",
    lifePath: "Expressive, imaginative and warm: gifted with words and creativity, learning to focus their many talents.",
    good: ["Creating or writing", "Meeting friends", "Sharing ideas"],
    care: ["Scattered energy", "Gossip"],
    affirmation: "I express myself freely and joyfully.",
  },
  4: {
    name: "The Builder",
    keyword: "Order and effort",
    color: "#4FB286",
    colorName: "Jade green",
    day: "A grounded, practical day. Structure, routines and finishing tasks are favoured.",
    month: "A month for organising, budgeting and laying foundations. Steady effort pays off.",
    year: "A year for foundations: hard work, planning, health routines and building something lasting.",
    lifePath: "Reliable, disciplined builders: practical, loyal and thorough, learning to stay flexible.",
    good: ["Planning and admin", "Organising your space", "Steady workouts"],
    care: ["Rigidity", "Overworking"],
    affirmation: "I build my life one steady step at a time.",
  },
  5: {
    name: "The Free Spirit",
    keyword: "Change and adventure",
    color: "#4A9FE0",
    colorName: "Sky blue",
    day: "A restless, energetic day. Expect change, movement and surprises, so stay adaptable.",
    month: "A month of change, travel and new experiences. Loosen routines and stay open.",
    year: "A year of change and freedom. Expect movement, new people and opportunities, so keep your balance.",
    lifePath: "Adventurous, curious and versatile: they thrive on variety and freedom, learning commitment and moderation.",
    good: ["Trying something new", "A change of scene", "Active movement"],
    care: ["Impulsiveness", "Overindulgence"],
    affirmation: "I welcome change with an open heart.",
  },
  6: {
    name: "The Nurturer",
    keyword: "Care and harmony",
    color: "#E1739F",
    colorName: "Rose pink",
    day: "A warm day centred on home, family and beauty. Care and responsibility are in focus.",
    month: "A month centred on home, family and relationships. Give care, and remember to receive it.",
    year: "A year of love, family and responsibility. Home and relationships ask for your time and care.",
    lifePath: "Caring, responsible and artistic: natural nurturers who seek harmony, learning to set healthy limits.",
    good: ["Cooking and home", "Time with loved ones", "Self-care"],
    care: ["Over-giving", "Perfectionism"],
    affirmation: "I care for others and for myself.",
  },
  7: {
    name: "The Seeker",
    keyword: "Reflect and rest",
    color: "#7E63DB",
    colorName: "Iris violet",
    day: "A quiet, reflective day. Solitude, study and rest bring clarity, and it is not the best day to rush.",
    month: "A month for reflection, learning and inner work. Slow down and trust your intuition.",
    year: "A year of inner growth, study and spiritual reflection. Rest, research and listen inward.",
    lifePath: "Thoughtful analysts and seekers: intuitive, private and curious, learning to trust and to open up.",
    good: ["Meditation and journaling", "Reading or study", "Time in nature"],
    care: ["Isolation", "Overthinking"],
    affirmation: "I trust my inner wisdom.",
  },
  8: {
    name: "The Achiever",
    keyword: "Power and results",
    color: "#C9962F",
    colorName: "Gold",
    day: "A driven, results-focused day. Business, money and ambition are highlighted.",
    month: "A month for career, finances and visible results. Act with confidence and integrity.",
    year: "A year of achievement, finances and authority. Effort is rewarded, so aim high and stay fair.",
    lifePath: "Ambitious, capable and business-minded: natural managers learning to balance success with values.",
    good: ["Financial planning", "Big-picture decisions", "Negotiating"],
    care: ["Workaholism", "Control"],
    affirmation: "I create abundance with integrity.",
  },
  9: {
    name: "The Humanitarian",
    keyword: "Complete and release",
    color: "#AD5CC6",
    colorName: "Orchid",
    day: "A day of completion and letting go. Finish what is unfinished, forgive and be generous.",
    month: "A month for wrapping up, clearing out and forgiving. Make space for what comes next.",
    year: "The closing year of the cycle. Release what no longer serves you, finish old chapters and give generously.",
    lifePath: "Compassionate, idealistic and wise: generous souls who serve others, learning to let go.",
    good: ["Decluttering", "Giving or volunteering", "Closing loops"],
    care: ["Holding on", "Emotional overload"],
    affirmation: "I release what is complete and welcome the new.",
  },
  11: {
    name: "The Illuminator",
    keyword: "Intuition and insight",
    color: "#8F98F2",
    colorName: "Silver lilac",
    day: "A heightened, intuitive day. Ideas and inspiration flow, but nerves can run high, so stay grounded.",
    month: "A month of insight and heightened sensitivity. Listen to your intuition and rest when overwhelmed.",
    year: "A master-number year of inspiration, intuition and spiritual awareness. Stay grounded as the energy runs high.",
    lifePath: "A master number linked with intuition, inspiration and vision: sensitive and idealistic, with a gift for uplifting others.",
    good: ["Creative inspiration", "Meditation", "Sharing insights"],
    care: ["Anxiety", "Overstimulation"],
    affirmation: "I trust and share my inner light.",
  },
  22: {
    name: "The Master Builder",
    keyword: "Vision into form",
    color: "#3FA89C",
    colorName: "Teal",
    day: "A powerful day for turning big ideas into practical plans. Think large and build step by step.",
    month: "A month for building something significant. Combine vision with disciplined action.",
    year: "A master-number year of large-scale building, where dreams can become real with steady work.",
    lifePath: "A master number of the visionary builder: practical and ambitious, able to turn big dreams into reality.",
    good: ["Long-term planning", "Building a system", "Leading a team"],
    care: ["Pressure", "Self-doubt"],
    affirmation: "I turn vision into reality, step by step.",
  },
  33: {
    name: "The Master Teacher",
    keyword: "Compassion and service",
    color: "#DD6FA8",
    colorName: "Soft magenta",
    day: "A day for compassion, teaching and service. Give from a full cup.",
    month: "A month for healing, guiding and caring for others. Protect your own energy too.",
    year: "A master-number year of compassion, service and uplifting others. Look after yourself as you give.",
    lifePath: "A rare master number associated with selfless love, healing and teaching.",
    good: ["Helping or teaching", "Acts of care", "Creative healing"],
    care: ["Self-sacrifice", "Burnout"],
    affirmation: "I give with love and keep my cup full.",
  },
};

export function numerologyReading(n: number): NumerologyReading {
  return NUMEROLOGY_CONTENT[n] ?? NUMEROLOGY_CONTENT[1];
}

/**
 * What each Challenge number asks you to work through -- the growth edge
 * of that number, rather than its everyday keyword. Challenges can be 0
 * (no single fixed obstacle) and are never master numbers.
 */
export const CHALLENGE_TEXT: Record<number, string> = {
  0: "The challenge of unlimited choice: with no single fixed obstacle, the risk is drifting without direction. Learn to commit and choose deliberately.",
  1: "Learning to stand on your own two feet and lead without becoming domineering, selfish or overly dependent on others for approval.",
  2: "Overcoming oversensitivity, shyness or indecision, and learning to cooperate without losing your own voice.",
  3: "Learning to focus scattered talents and speak your truth, without hiding behind humour, criticism or self-doubt.",
  4: "Overcoming rigidity or resistance to hard work, and learning to build steady foundations without becoming stuck in a rut.",
  5: "Learning to use freedom wisely, resisting overindulgence and restlessness, and following through on commitments.",
  6: "Overcoming a tendency to control, worry or over-give, and learning to accept imperfection in yourself and others.",
  7: "Learning to trust and open up to others, overcoming isolation, cynicism or a fear of being truly seen.",
  8: "Overcoming struggles with power, money or recognition, and learning to use ambition with fairness and integrity.",
  9: "Learning to let go, forgive and give generously, without becoming emotionally overwhelmed or resentful.",
};

export function challengeText(n: number): string {
  return CHALLENGE_TEXT[n] ?? CHALLENGE_TEXT[0];
}
