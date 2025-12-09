'use client'

import { useState, useMemo, useEffect } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Instagram, Copy, Check, Share2, Heart, 
  Briefcase, Coffee, Sparkles, Laugh, Smile, Camera,
  TrendingUp, Music, Plane, Utensils, Dumbbell, Palette, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

type Mode = 'bio' | 'caption'
type Category = 'all' | 'funny' | 'romantic' | 'professional' | 'casual' | 'inspirational' | 'creative' | 'fitness' | 'travel' | 'food' | 'fashion' | 'tech' | 'motivational'

interface LikedItem {
  id: string
  mode: Mode
  category: string
}

const BIO_CATEGORIES: Record<string, string[]> = {
  funny: [
    "Professional napper 🛌 | Coffee enthusiast ☕ | Part-time superhero 🦸‍♀️",
    "Living my best life, one meme at a time 😂 | Professional procrastinator",
    "I put the 'pro' in procrastination 🎯 | Coffee is my love language ☕",
    "Warning: May cause excessive laughter 😂 | Professional goofball",
    "I'm not lazy, I'm in energy-saving mode 💤 | Coffee addict ☕",
    "Life's too short to be serious all the time 😄 | Professional jokester",
    "I make bad decisions so you don't have to 😅 | Your friendly neighborhood chaos",
    "Professional overthinker 🤔 | Part-time comedian | Full-time snack enthusiast",
    "I'm not weird, I'm limited edition ✨ | Coffee-powered human ☕",
    "Living proof that miracles happen 🙌 | Professional daydreamer",
    "I'm not short, I'm fun-sized 😄 | Coffee is my therapy ☕",
    "Warning: Sarcasm may occur 😏 | Professional smart aleck",
    "I'm not arguing, I'm just explaining why I'm right 💁‍♀️ | Coffee enthusiast ☕",
    "Professional Netflix watcher 📺 | Part-time human | Full-time snack lover",
    "I'm not late, I'm fashionably delayed ⏰ | Coffee-powered ☕",
    "I'm not lost, I'm exploring 😂 | Professional wanderer",
    "Coffee first, questions later ☕ | Professional caffeine addict",
    "I'm not procrastinating, I'm prioritizing my mental health 😅",
    "Professional snack tester 🍪 | Part-time human | Full-time foodie",
    "I'm not weird, I'm just limited edition ✨ | One of a kind",
    "Living my best chaotic life 😂 | Professional mess maker",
    "I'm not lazy, I'm just highly motivated to do nothing 💤",
    "Professional meme curator 😂 | Part-time adult | Full-time child",
    "I'm not arguing, I'm just passionately expressing my point 💁‍♀️",
    "Coffee is my love language ☕ | Professional barista wannabe",
    "I'm not short, I'm vertically challenged 😄 | Perfect height",
    "Professional time waster ⏰ | Part-time productive | Full-time procrastinator",
    "I'm not weird, I'm just creatively different ✨",
    "Living proof that chaos can be beautiful 😂 | Professional disaster",
    "I'm not lost, I'm just taking the scenic route 🗺️"
  ],
  romantic: [
    "In love with life and the person who makes it beautiful 💕 | Forever grateful ✨",
    "You are my today and all of my tomorrows 💖 | Living our best love story",
    "Every love story is beautiful, but ours is my favorite 💕 | Together forever",
    "In your smile, I see something more beautiful than the stars ✨ | My everything 💖",
    "Love is not about how many days, months, or years you've been together. It's about how much you love each other every single day 💕",
    "You are my sunshine, my only sunshine ☀️ | Making me happy when skies are gray 💕",
    "I fell in love with you because of a million tiny things you never knew you were doing 💖",
    "You are my today and all of my tomorrows 💕 | My person, my home, my heart",
    "In a sea of people, my eyes will always search for you 🌊 | You're my anchor 💕",
    "You are my favorite place to go when my mind searches for peace 💖 | My safe haven",
    "I choose you. And I'll choose you over and over and over. Without pause, without a doubt, in a heartbeat. I'll keep choosing you 💕",
    "You are my today and all of my tomorrows 💖 | Forever and always",
    "In your arms is my favorite place to be 💕 | Home is wherever you are",
    "You are my today and all of my tomorrows ✨ | My person, my love, my life",
    "Every moment with you is a gift 💕 | Grateful for our love story",
    "You are my favorite hello and my hardest goodbye 💖 | My everything",
    "In your eyes, I found my home 💕 | Forever yours",
    "You are the reason I believe in love 💖 | My heart belongs to you",
    "Every day with you is a new adventure 💕 | My partner in crime",
    "You are my today and all of my tomorrows 💖 | My forever",
    "In your arms, I found my peace 💕 | My safe place",
    "You are the best part of my day 💖 | My sunshine",
    "Every moment with you is magical 💕 | My love",
    "You are my heart, my soul, my everything 💖 | Forever grateful",
    "In your smile, I see my future 💕 | My person",
    "You are my favorite person in the whole world 💖 | My everything",
    "Every day I fall in love with you more 💕 | My forever",
    "You are my home, my heart, my life 💖 | My love",
    "In your eyes, I see forever 💕 | My soulmate",
    "You are my today and all of my tomorrows 💖 | My always"
  ],
  professional: [
    "Building something meaningful, one step at a time 💼 | Entrepreneur | Innovator",
    "Excellence is not a skill, it's an attitude ✨ | Professional | Leader",
    "Success is the sum of small efforts repeated day in and day out 📈 | Business Owner",
    "Turning ideas into reality 💡 | CEO | Founder | Innovator",
    "Building brands that matter 🚀 | Marketing Expert | Creative Director",
    "Transforming businesses through innovation 💼 | Consultant | Strategist",
    "Creating value, one project at a time 📊 | Professional | Problem Solver",
    "Excellence in everything I do ✨ | Leader | Mentor | Visionary",
    "Building the future, one day at a time 🚀 | Entrepreneur | Innovator",
    "Professional excellence is my standard 💼 | Results-driven | Strategic thinker",
    "Creating opportunities and building success 📈 | Business Professional",
    "Innovation meets execution 💡 | Professional | Change maker",
    "Building something bigger than myself 🚀 | Entrepreneur | Leader",
    "Excellence is a habit, not an act ✨ | Professional | Perfectionist",
    "Transforming challenges into opportunities 💼 | Strategic Professional",
    "Leading with purpose and passion 💼 | Executive | Visionary",
    "Creating impact through innovation 🚀 | Business Leader | Strategist",
    "Building sustainable success 📈 | Professional | Entrepreneur",
    "Excellence in execution ✨ | Results-oriented | Leader",
    "Transforming vision into reality 💡 | CEO | Founder",
    "Building meaningful connections 💼 | Network Builder | Professional",
    "Creating value through excellence 🚀 | Business Professional",
    "Leading with integrity and innovation 💼 | Executive | Leader",
    "Building the future today 🚀 | Innovator | Entrepreneur",
    "Excellence is my commitment ✨ | Professional | Perfectionist",
    "Transforming ideas into impact 💡 | Business Leader | Strategist",
    "Building success through collaboration 💼 | Team Leader | Professional",
    "Creating opportunities for growth 📈 | Business Professional | Mentor",
    "Leading with vision and purpose 🚀 | Executive | Innovator",
    "Building excellence, one day at a time ✨ | Professional | Leader"
  ],
  casual: [
    "Just vibing through life ✨ | Coffee lover ☕ | Good vibes only",
    "Living life one adventure at a time 🌟 | Coffee enthusiast ☕",
    "Here for a good time, not a long time 😊 | Coffee-powered ☕",
    "Just a human trying to figure it out 🤷‍♀️ | Coffee addict ☕",
    "Living my truth, one day at a time ✨ | Coffee is life ☕",
    "Just here, doing my thing 🌟 | Coffee enthusiast ☕ | Good vibes",
    "Living life on my own terms ✨ | Coffee lover ☕",
    "Just trying to adult properly 😅 | Coffee-powered ☕",
    "Living my best life, one day at a time ✨ | Coffee enthusiast ☕",
    "Just a simple human with big dreams 🌟 | Coffee is my fuel ☕",
    "Living life with no regrets ✨ | Coffee addict ☕",
    "Just vibing and surviving 😊 | Coffee-powered ☕",
    "Living authentically, one moment at a time ✨ | Coffee lover ☕",
    "Just here, being me 🌟 | Coffee enthusiast ☕",
    "Living life with gratitude ✨ | Coffee is life ☕",
    "Just going with the flow 🌊 | Coffee-powered ☕ | Good vibes",
    "Living life one day at a time ✨ | Coffee enthusiast ☕",
    "Just being authentically me 🌟 | Coffee lover ☕",
    "Living my best life ✨ | Coffee is fuel ☕",
    "Just here, vibing 🌟 | Coffee-powered ☕",
    "Living life with intention ✨ | Coffee enthusiast ☕",
    "Just doing my thing 🌟 | Coffee lover ☕",
    "Living authentically ✨ | Coffee is life ☕",
    "Just vibing through life 🌟 | Coffee-powered ☕",
    "Living life on my terms ✨ | Coffee enthusiast ☕",
    "Just being me 🌟 | Coffee lover ☕",
    "Living with gratitude ✨ | Coffee is fuel ☕",
    "Just going with the flow 🌊 | Coffee-powered ☕",
    "Living my truth ✨ | Coffee enthusiast ☕",
    "Just vibing 🌟 | Coffee lover ☕"
  ],
  inspirational: [
    "Believe in yourself and all that you are ✨ | You are capable of amazing things",
    "Your limitation—it's only your imagination 🚀 | Dream big, achieve bigger",
    "Push yourself, because no one else is going to do it for you 💪 | Self-motivated",
    "Great things never come from comfort zones 🌟 | Growth mindset",
    "Dream it. Wish it. Do it. ✨ | Making it happen, one step at a time",
    "Success doesn't just find you. You have to go out and get it 🎯 | Goal-oriented",
    "The harder you work for something, the greater you'll feel when you achieve it 💪",
    "Dream bigger. Do bigger. ✨ | Living with purpose",
    "If opportunity doesn't knock, build a door 🚪 | Creating my own path",
    "Don't stop when you're tired. Stop when you're done 💪 | Persistence pays off",
    "Wake up with determination. Go to bed with satisfaction ✨ | Daily progress",
    "Do something today that your future self will thank you for 🌟 | Forward-thinking",
    "The only way to do great work is to love what you do 💖 | Passion-driven",
    "Your potential is endless. Go do what you were created to do ✨ | Purpose-driven",
    "Be yourself; everyone else is already taken 🌟 | Authentic living",
    "The future belongs to those who believe in the beauty of their dreams ✨",
    "Success is walking from failure to failure with no loss of enthusiasm 🚀",
    "The way to get started is to quit talking and begin doing 💪 | Action-oriented",
    "You are never too old to set another goal or to dream a new dream 🌟",
    "The only person you are destined to become is the person you decide to be ✨",
    "It does not matter how slowly you go as long as you do not stop 🚀",
    "The future depends on what you do today ✨ | Make it count",
    "Success is the sum of small efforts repeated day in and day out 💪",
    "The only way to achieve the impossible is to believe it is possible 🌟",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart ✨",
    "Your limitation is only your imagination 🚀 | Dream bigger",
    "Great things never come from comfort zones 🌟 | Step outside",
    "Believe you can and you're halfway there ✨ | Self-belief",
    "The only impossible journey is the one you never begin 🚀",
    "Success is not final, failure is not fatal: it is the courage to continue that counts 💪"
  ],
  creative: [
    "Creating magic, one project at a time ✨ | Artist | Designer | Creator",
    "Turning imagination into reality 🎨 | Creative Professional | Visual Artist",
    "Where creativity meets passion 🎭 | Artist | Designer | Innovator",
    "Creating beauty in everything I do ✨ | Creative Professional | Artist",
    "Art is not what you see, but what you make others see 🎨 | Visual Creator",
    "Creating stories through visuals 📸 | Photographer | Designer | Artist",
    "Where ideas come to life ✨ | Creative Director | Artist | Designer",
    "Creating with passion and purpose 🎨 | Visual Artist | Designer",
    "Turning visions into reality ✨ | Creative Professional | Artist",
    "Creating moments that matter 🎭 | Artist | Designer | Storyteller",
    "Where creativity flows freely ✨ | Visual Creator | Designer",
    "Creating art that speaks 🎨 | Artist | Creative Professional",
    "Turning inspiration into creation ✨ | Designer | Artist | Innovator",
    "Creating beauty, one piece at a time 🎭 | Visual Artist | Designer",
    "Where creativity knows no bounds ✨ | Artist | Designer | Creator",
    "Creating magic through art 🎨 | Visual Artist | Creative Professional",
    "Turning ideas into visual stories ✨ | Designer | Artist | Creator",
    "Creating with heart and soul 🎭 | Visual Artist | Designer",
    "Where creativity meets innovation ✨ | Artist | Designer | Creator",
    "Creating art that inspires 🎨 | Visual Creator | Artist",
    "Turning dreams into reality ✨ | Creative Professional | Artist",
    "Creating beauty through design 🎨 | Designer | Visual Artist",
    "Where creativity takes flight ✨ | Artist | Creator | Innovator",
    "Creating art that moves people 🎭 | Visual Artist | Designer",
    "Turning inspiration into art ✨ | Artist | Creative Professional",
    "Creating visual stories 🎨 | Designer | Artist | Creator",
    "Where creativity lives ✨ | Artist | Designer | Visual Creator",
    "Creating art that matters 🎭 | Visual Artist | Designer",
    "Turning ideas into creations ✨ | Creative Professional | Artist",
    "Creating beauty in the world 🎨 | Artist | Designer | Creator"
  ],
  fitness: [
    "Fitness is not about being better than someone else. It's about being better than you used to be 💪 | Fitness Enthusiast",
    "Strong body, strong mind 💪 | Fitness Coach | Health Advocate",
    "Your body can do it. It's your mind you need to convince 🧠 | Fitness Enthusiast",
    "Train like an athlete, eat like a nutritionist, sleep like a baby 💪 | Fitness Professional",
    "The only bad workout is the one that didn't happen 💪 | Fitness Enthusiast",
    "Strength doesn't come from what you can do. It comes from overcoming what you once thought you couldn't 💪",
    "Fitness is not a destination, it's a way of life 🏋️ | Health & Wellness",
    "Your body is a temple, but only if you treat it as one 💪 | Fitness Enthusiast",
    "The pain you feel today will be the strength you feel tomorrow 💪 | Fitness Professional",
    "Fitness is not about being perfect. It's about being better 💪 | Health Advocate",
    "Strong is the new beautiful 💪 | Fitness Enthusiast | Wellness Coach",
    "Your health is an investment, not an expense 💪 | Fitness Professional",
    "The only workout you'll regret is the one you didn't do 💪 | Fitness Enthusiast",
    "Fitness is a journey, not a destination 🏋️ | Health & Wellness",
    "Train insane or remain the same 💪 | Fitness Enthusiast",
    "Fitness is not a punishment, it's a reward 💪 | Health Advocate",
    "Your body can do it. It's your mind you need to convince 🧠",
    "Fitness is about progress, not perfection 💪 | Wellness Coach",
    "The only bad workout is the one that didn't happen 💪 | Fitness Enthusiast",
    "Strong body, strong mind, strong spirit 💪 | Health & Wellness",
    "Fitness is a lifestyle, not a temporary fix 🏋️ | Health Advocate",
    "Your health is your wealth 💪 | Fitness Professional",
    "The pain you feel today is the strength you feel tomorrow 💪",
    "Fitness is not about being perfect, it's about being better 💪",
    "Strong is the new beautiful 💪 | Fitness Enthusiast",
    "Your body can do it. It's your mind you need to convince 🧠 | Fitness Coach",
    "Fitness is a journey, not a destination 🏋️ | Health & Wellness",
    "Train like an athlete, live like a champion 💪 | Fitness Professional",
    "The only workout you'll regret is the one you didn't do 💪",
    "Fitness is not a destination, it's a way of life 🏋️ | Health Advocate"
  ],
  travel: [
    "Not all those who wander are lost ✈️ | Travel Enthusiast | Adventure Seeker",
    "Collecting moments, not things 🌍 | Travel Blogger | Adventure Lover",
    "Travel is the only thing you buy that makes you richer ✈️ | Wanderlust",
    "Adventure is out there 🌍 | Travel Enthusiast | Explorer",
    "The world is a book, and those who do not travel read only one page 📖 | Traveler",
    "Travel far, travel wide, travel often ✈️ | Adventure Seeker | Explorer",
    "Life is short and the world is wide 🌍 | Travel Enthusiast | Wanderer",
    "Travel makes one modest. You see what a tiny place you occupy in the world ✈️",
    "Adventure awaits 🌍 | Travel Blogger | Explorer | Wanderlust",
    "Travel is my therapy ✈️ | Adventure Seeker | Travel Enthusiast",
    "The world is calling, and I must go 🌍 | Traveler | Explorer",
    "Travel far enough to meet yourself ✈️ | Adventure Seeker | Wanderer",
    "Adventure is worthwhile in itself 🌍 | Travel Enthusiast | Explorer",
    "Travel. Your money will return. Your time won't ✈️ | Wanderlust",
    "Explore. Dream. Discover. 🌍 | Travel Enthusiast | Adventure Lover",
    "Not all those who wander are lost ✈️ | Travel Blogger | Explorer",
    "Collecting memories, one destination at a time 🌍 | Travel Enthusiast",
    "Travel is the only thing you buy that makes you richer ✈️ | Wanderlust",
    "Adventure is calling 🌍 | Travel Enthusiast | Explorer",
    "The world is my playground ✈️ | Travel Blogger | Adventure Seeker",
    "Travel far, travel wide, travel often ✈️ | Adventure Lover",
    "Life is short, travel often 🌍 | Travel Enthusiast | Explorer",
    "Travel makes one modest ✈️ | Wanderer | Explorer",
    "Adventure awaits around every corner 🌍 | Travel Blogger",
    "Travel is my therapy ✈️ | Adventure Seeker",
    "The world is calling 🌍 | Traveler | Explorer",
    "Travel far enough to meet yourself ✈️ | Adventure Seeker",
    "Adventure is worthwhile 🌍 | Travel Enthusiast",
    "Travel. Your money will return. Your time won't ✈️ | Wanderlust",
    "Explore. Dream. Discover. 🌍 | Travel Enthusiast | Adventure Lover"
  ],
  food: [
    "Food is my love language 🍕 | Foodie | Recipe Creator | Culinary Enthusiast",
    "Life is too short for bad food 🍔 | Food Blogger | Recipe Developer",
    "Good food, good mood 🍰 | Foodie | Culinary Creator | Recipe Enthusiast",
    "Food brings people together 🍕 | Food Blogger | Recipe Creator",
    "Eating is a necessity, but cooking is an art 🍳 | Chef | Food Enthusiast",
    "Food is not just eating energy, it's an experience 🍔 | Foodie | Culinary Lover",
    "One cannot think well, love well, sleep well, if one has not dined well 🍰",
    "Food is my therapy 🍕 | Food Blogger | Recipe Creator | Food Enthusiast",
    "Good food is good mood 🍔 | Foodie | Culinary Enthusiast",
    "Food is the ingredient that binds us together 🍰 | Food Blogger | Recipe Creator",
    "Cooking is love made visible 🍳 | Chef | Food Enthusiast | Recipe Developer",
    "Food is not just fuel, it's information 🍕 | Foodie | Health & Nutrition",
    "Good food, good friends, good times 🍔 | Food Blogger | Culinary Enthusiast",
    "Food is my passion 🍰 | Foodie | Recipe Creator | Culinary Lover",
    "Eating is a necessity, but cooking is an art 🍳 | Chef | Food Enthusiast",
    "Food brings people together 🍕 | Food Blogger | Recipe Creator",
    "Life is too short for bad food 🍔 | Food Enthusiast | Culinary Lover",
    "Good food, good mood 🍰 | Foodie | Recipe Creator",
    "Food is my love language 🍕 | Culinary Enthusiast | Food Blogger",
    "Cooking is love made visible 🍳 | Chef | Food Enthusiast",
    "Food is not just fuel, it's an experience 🍔 | Foodie | Culinary Creator",
    "Good food, good friends, good times 🍰 | Food Blogger | Recipe Enthusiast",
    "Food is my passion 🍕 | Foodie | Recipe Creator | Culinary Lover",
    "Eating is a necessity, but cooking is an art 🍳 | Chef | Food Enthusiast",
    "Food brings people together 🍔 | Food Blogger | Recipe Creator",
    "Life is too short for bad food 🍰 | Food Enthusiast | Culinary Lover",
    "Good food, good mood 🍕 | Foodie | Recipe Creator",
    "Food is my love language 🍔 | Culinary Enthusiast | Food Blogger",
    "Cooking is love made visible 🍳 | Chef | Food Enthusiast",
    "Food is not just fuel, it's information 🍕 | Foodie | Health & Nutrition"
  ],
  fashion: [
    "Fashion is what you adopt when you don't know who you are 👗 | Fashion Enthusiast | Style Blogger",
    "Style is a way to say who you are without having to speak 👔 | Fashionista | Style Creator",
    "Fashion is architecture: it is a matter of proportions 👗 | Fashion Designer | Style Enthusiast",
    "Fashion fades, style is eternal 👔 | Fashion Blogger | Style Creator",
    "Style is knowing who you are, what you want to say, and not giving a damn 👗",
    "Fashion is what you're offered four times a year by designers. Style is what you choose 👔",
    "Fashion is the armor to survive the reality of everyday life 👗 | Fashion Enthusiast",
    "Style is a way to express yourself without saying a word 👔 | Fashionista | Style Creator",
    "Fashion is about dressing according to what's fashionable. Style is more about being yourself 👗",
    "Fashion is instant language 👔 | Fashion Blogger | Style Enthusiast",
    "Style is a reflection of your attitude and personality 👗 | Fashionista | Style Creator",
    "Fashion is what you adopt when you don't know who you are 👔 | Fashion Enthusiast",
    "Style is knowing who you are 👗 | Fashion Blogger | Style Creator",
    "Fashion is architecture: it is a matter of proportions 👔 | Fashion Designer",
    "Style is a way to say who you are 👗 | Fashionista | Style Enthusiast",
    "Fashion fades, style is eternal 👔 | Fashion Blogger",
    "Style is a reflection of your attitude 👗 | Fashion Enthusiast",
    "Fashion is instant language 👔 | Style Creator",
    "Style is knowing who you are 👗 | Fashionista",
    "Fashion is architecture: it is a matter of proportions 👔 | Fashion Designer",
    "Style is a way to express yourself 👗 | Fashion Blogger | Style Creator",
    "Fashion is what you adopt when you don't know who you are 👔 | Fashion Enthusiast",
    "Style is a reflection of your personality 👗 | Fashionista | Style Creator",
    "Fashion fades, style is eternal 👔 | Fashion Blogger | Style Enthusiast",
    "Style is knowing who you are 👗 | Fashion Designer",
    "Fashion is instant language 👔 | Style Creator | Fashion Enthusiast",
    "Style is a way to say who you are 👗 | Fashionista | Style Blogger",
    "Fashion is architecture: it is a matter of proportions 👔 | Fashion Designer",
    "Style is a reflection of your attitude 👗 | Fashion Enthusiast | Style Creator",
    "Fashion fades, style is eternal 👔 | Fashion Blogger | Style Enthusiast"
  ],
  tech: [
    "Code is poetry written in logic 💻 | Developer | Tech Enthusiast | Problem Solver",
    "Building the future, one line of code at a time 🚀 | Software Developer | Tech Professional",
    "Technology is best when it brings people together 💻 | Tech Enthusiast | Developer",
    "Innovation distinguishes between a leader and a follower 💡 | Tech Professional | Innovator",
    "The best way to predict the future is to invent it 💻 | Developer | Tech Enthusiast",
    "Code is like humor. When you have to explain it, it's bad 💻 | Developer | Tech Professional",
    "Technology is a tool. What matters is how you use it 🚀 | Tech Enthusiast | Developer",
    "First, solve the problem. Then, write the code 💻 | Developer | Problem Solver",
    "Innovation is the ability to see change as an opportunity 💡 | Tech Professional | Innovator",
    "The future belongs to those who code 💻 | Developer | Tech Enthusiast",
    "Technology is nothing. What's important is that you have faith in people 🚀",
    "Code is poetry written in logic 💻 | Developer | Tech Professional",
    "The best code is no code at all 💻 | Developer | Tech Enthusiast",
    "Innovation distinguishes between a leader and a follower 💡 | Tech Professional",
    "Technology is best when it brings people together 💻 | Tech Enthusiast | Developer",
    "Building the future, one line of code at a time 🚀 | Software Developer",
    "Code is like humor. When you have to explain it, it's bad 💻 | Developer",
    "Technology is a tool. What matters is how you use it 🚀 | Tech Enthusiast",
    "First, solve the problem. Then, write the code 💻 | Developer",
    "The future belongs to those who code 💻 | Tech Enthusiast",
    "Code is poetry written in logic 💻 | Developer | Tech Professional",
    "Innovation is the ability to see change as an opportunity 💡 | Tech Professional",
    "Technology is best when it brings people together 💻 | Tech Enthusiast",
    "Building the future, one line of code at a time 🚀 | Software Developer",
    "Code is like humor. When you have to explain it, it's bad 💻 | Developer",
    "Technology is a tool. What matters is how you use it 🚀 | Tech Enthusiast",
    "First, solve the problem. Then, write the code 💻 | Developer | Problem Solver",
    "The future belongs to those who code 💻 | Tech Enthusiast | Developer",
    "Code is poetry written in logic 💻 | Developer | Tech Professional",
    "Innovation distinguishes between a leader and a follower 💡 | Tech Professional | Innovator"
  ],
  motivational: [
    "The only way to do great work is to love what you do 💪 | Motivational Speaker | Life Coach",
    "Success is not final, failure is not fatal: it is the courage to continue that counts 🚀",
    "Believe you can and you're halfway there ✨ | Motivational Speaker | Life Coach",
    "The future belongs to those who believe in the beauty of their dreams 🌟",
    "Don't watch the clock; do what it does. Keep going ⏰ | Motivational Speaker",
    "The only impossible journey is the one you never begin 🚀 | Life Coach | Motivator",
    "Success is walking from failure to failure with no loss of enthusiasm 💪",
    "The way to get started is to quit talking and begin doing ✨ | Motivational Speaker",
    "You are never too old to set another goal or to dream a new dream 🌟",
    "The only person you are destined to become is the person you decide to be 💪",
    "It does not matter how slowly you go as long as you do not stop 🚀 | Motivator",
    "The future depends on what you do today ✨ | Motivational Speaker | Life Coach",
    "Success is the sum of small efforts repeated day in and day out 💪",
    "The only way to achieve the impossible is to believe it is possible 🌟",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart ✨",
    "The only way to do great work is to love what you do 💪 | Life Coach",
    "Success is not final, failure is not fatal 🚀 | Motivational Speaker",
    "Believe you can and you're halfway there ✨ | Motivator",
    "The future belongs to those who believe 🌟 | Motivational Speaker",
    "Don't watch the clock; do what it does ⏰ | Life Coach",
    "The only impossible journey is the one you never begin 🚀 | Motivator",
    "Success is walking from failure to failure 💪 | Motivational Speaker",
    "The way to get started is to quit talking ✨ | Life Coach",
    "You are never too old to set another goal 🌟 | Motivational Speaker",
    "The only person you are destined to become 💪 | Life Coach",
    "It does not matter how slowly you go 🚀 | Motivator",
    "The future depends on what you do today ✨ | Motivational Speaker",
    "Success is the sum of small efforts 💪 | Life Coach",
    "The only way to achieve the impossible 🌟 | Motivational Speaker",
    "Don't be pushed around by the fears ✨ | Life Coach | Motivator"
  ]
}

const CAPTION_CATEGORIES: Record<string, string[]> = {
  funny: [
    "POV: You're scrolling through Instagram instead of doing actual work 😂",
    "When life gives you lemons, make lemonade. When life gives you WiFi, make memes 🍋",
    "I'm not arguing, I'm just explaining why I'm right 💁‍♀️",
    "Warning: May cause excessive laughter 😂 | Proceed with caution",
    "I put the 'pro' in procrastination 🎯 | Professional time waster",
    "Living my best life, one meme at a time 😂 | Professional goofball",
    "I'm not lazy, I'm in energy-saving mode 💤 | Coffee-powered ☕",
    "When you realize it's Monday again 😅 | Here we go again",
    "POV: You're trying to adult but failing miserably 😂 | Send help",
    "I make bad decisions so you don't have to 😅 | You're welcome",
    "Warning: Sarcasm may occur 😏 | Professional smart aleck",
    "I'm not weird, I'm limited edition ✨ | One of a kind",
    "Living proof that miracles happen 🙌 | Still here somehow",
    "I'm not short, I'm fun-sized 😄 | Perfect height for hugs",
    "When you're trying to be productive but Netflix exists 📺 | Oops",
    "I'm not late, I'm fashionably delayed ⏰ | Time is relative",
    "Professional overthinker 🤔 | Part-time comedian | Full-time snack enthusiast",
    "I'm not arguing, I'm just explaining why I'm right 💁‍♀️ | Trust me",
    "When life gives you Monday, make it a Friday 😂 | Weekend vibes",
    "I'm not lazy, I'm just highly motivated to do nothing 💤 | Expert level",
    "POV: You're reading this instead of working 😂 | Same energy",
    "When you realize adulting is just pretending you know what you're doing 😅",
    "I'm not lost, I'm exploring 😂 | Professional wanderer",
    "Coffee first, questions later ☕ | Professional caffeine addict",
    "I'm not procrastinating, I'm prioritizing my mental health 😅",
    "Professional snack tester 🍪 | Part-time human | Full-time foodie",
    "I'm not weird, I'm just creatively different ✨",
    "Living my best chaotic life 😂 | Professional mess maker",
    "I'm not lazy, I'm just highly motivated to do nothing 💤",
    "Professional meme curator 😂 | Part-time adult | Full-time child"
  ],
  romantic: [
    "In your smile, I see something more beautiful than the stars ✨ | My everything 💕",
    "You are my today and all of my tomorrows 💖 | Forever grateful",
    "Every love story is beautiful, but ours is my favorite 💕 | Our story",
    "In a sea of people, my eyes will always search for you 🌊 | You're my anchor",
    "You are my favorite place to go when my mind searches for peace 💖 | My safe haven",
    "I choose you. And I'll choose you over and over and over 💕 | Always",
    "You are my today and all of my tomorrows 💖 | Forever and always",
    "In your arms is my favorite place to be 💕 | Home is wherever you are",
    "You are my sunshine, my only sunshine ☀️ | Making me happy",
    "I fell in love with you because of a million tiny things you never knew you were doing 💖",
    "Every moment with you is a gift 💕 | Grateful for our love",
    "You are my person, my home, my heart 💖 | My everything",
    "In your smile, I see my future ✨ | Forever grateful",
    "You are my today and all of my tomorrows 💕 | My person, my love",
    "Every love story is beautiful, but ours is my favorite 💖 | Our journey",
    "You are my favorite place to go when my mind searches for peace 💕 | My anchor",
    "I choose you. And I'll choose you over and over 💖 | Without pause",
    "In your arms is my favorite place to be 💕 | Home",
    "You are my sunshine ☀️ | My only sunshine 💖",
    "Every moment with you is a gift 💕 | Forever grateful",
    "You are my favorite hello and my hardest goodbye 💖 | My everything",
    "In your eyes, I found my home 💕 | Forever yours",
    "You are the reason I believe in love 💖 | My heart belongs to you",
    "Every day with you is a new adventure 💕 | My partner in crime",
    "You are my today and all of my tomorrows 💖 | My forever",
    "In your arms, I found my peace 💕 | My safe place",
    "You are the best part of my day 💖 | My sunshine",
    "Every moment with you is magical 💕 | My love",
    "You are my heart, my soul, my everything 💖 | Forever grateful",
    "In your smile, I see my future 💕 | My person"
  ],
  professional: [
    "Building something meaningful, one step at a time 💼 | Excellence in everything",
    "Success is the sum of small efforts repeated day in and day out 📈 | Professional growth",
    "Excellence is not a skill, it's an attitude ✨ | Professional excellence",
    "Turning ideas into reality 💡 | Innovation meets execution",
    "Building brands that matter 🚀 | Creating value, one project at a time",
    "Transforming businesses through innovation 💼 | Strategic thinking",
    "Creating opportunities and building success 📈 | Results-driven",
    "Excellence is a habit, not an act ✨ | Professional standards",
    "Building the future, one day at a time 🚀 | Innovation leader",
    "Professional excellence is my standard 💼 | Quality focused",
    "Creating value, one project at a time 📊 | Strategic professional",
    "Innovation meets execution 💡 | Change maker",
    "Building something bigger than myself 🚀 | Entrepreneurial spirit",
    "Excellence is a habit ✨ | Professional perfectionist",
    "Transforming challenges into opportunities 💼 | Strategic professional",
    "Building meaningful connections 📈 | Professional network",
    "Creating value through innovation 💡 | Professional excellence",
    "Building the future 🚀 | Innovation leader",
    "Excellence in everything ✨ | Professional standards",
    "Transforming ideas into reality 💼 | Strategic execution"
  ],
  casual: [
    "Just vibing through life ✨ | Coffee lover ☕ | Good vibes only",
    "Living life one adventure at a time 🌟 | Coffee enthusiast ☕",
    "Here for a good time, not a long time 😊 | Coffee-powered ☕",
    "Just a human trying to figure it out 🤷‍♀️ | Coffee addict ☕",
    "Living my truth, one day at a time ✨ | Coffee is life ☕",
    "Just here, doing my thing 🌟 | Coffee enthusiast ☕ | Good vibes",
    "Living life on my own terms ✨ | Coffee lover ☕",
    "Just trying to adult properly 😅 | Coffee-powered ☕",
    "Living my best life, one day at a time ✨ | Coffee enthusiast ☕",
    "Just a simple human with big dreams 🌟 | Coffee is my fuel ☕",
    "Living life with no regrets ✨ | Coffee addict ☕",
    "Just vibing and surviving 😊 | Coffee-powered ☕",
    "Living authentically, one moment at a time ✨ | Coffee lover ☕",
    "Just here, being me 🌟 | Coffee enthusiast ☕",
    "Living life with gratitude ✨ | Coffee is life ☕",
    "Just vibing through life ✨ | Coffee-powered ☕",
    "Living life one day at a time 🌟 | Coffee enthusiast ☕",
    "Just being authentically me ✨ | Coffee lover ☕",
    "Living my best life 🌟 | Coffee is fuel ☕",
    "Just here, vibing ✨ | Coffee-powered ☕"
  ],
  inspirational: [
    "Believe in yourself and all that you are ✨ | You are capable of amazing things",
    "Your limitation—it's only your imagination 🚀 | Dream big, achieve bigger",
    "Push yourself, because no one else is going to do it for you 💪 | Self-motivated",
    "Great things never come from comfort zones 🌟 | Growth mindset",
    "Dream it. Wish it. Do it. ✨ | Making it happen, one step at a time",
    "Success doesn't just find you. You have to go out and get it 🎯 | Goal-oriented",
    "The harder you work for something, the greater you'll feel when you achieve it 💪",
    "Dream bigger. Do bigger. ✨ | Living with purpose",
    "If opportunity doesn't knock, build a door 🚪 | Creating my own path",
    "Don't stop when you're tired. Stop when you're done 💪 | Persistence pays off",
    "Wake up with determination. Go to bed with satisfaction ✨ | Daily progress",
    "Do something today that your future self will thank you for 🌟 | Forward-thinking",
    "The only way to do great work is to love what you do 💖 | Passion-driven",
    "Your potential is endless. Go do what you were created to do ✨ | Purpose-driven",
    "Be yourself; everyone else is already taken 🌟 | Authentic living",
    "The future belongs to those who believe in the beauty of their dreams ✨",
    "Success is walking from failure to failure with no loss of enthusiasm 🚀",
    "The way to get started is to quit talking and begin doing 💪 | Action-oriented",
    "You are never too old to set another goal or to dream a new dream 🌟",
    "The only person you are destined to become is the person you decide to be ✨"
  ],
  creative: [
    "Creating magic, one project at a time ✨ | Artist | Designer | Creator",
    "Turning imagination into reality 🎨 | Creative Professional | Visual Artist",
    "Where creativity meets passion 🎭 | Artist | Designer | Innovator",
    "Creating beauty in everything I do ✨ | Creative Professional | Artist",
    "Art is not what you see, but what you make others see 🎨 | Visual Creator",
    "Creating stories through visuals 📸 | Photographer | Designer | Artist",
    "Where ideas come to life ✨ | Creative Director | Artist | Designer",
    "Creating with passion and purpose 🎨 | Visual Artist | Designer",
    "Turning visions into reality ✨ | Creative Professional | Artist",
    "Creating moments that matter 🎭 | Artist | Designer | Storyteller",
    "Where creativity flows freely ✨ | Visual Creator | Designer",
    "Creating art that speaks 🎨 | Artist | Creative Professional",
    "Turning inspiration into creation ✨ | Designer | Artist | Innovator",
    "Creating beauty, one piece at a time 🎭 | Visual Artist | Designer",
    "Where creativity knows no bounds ✨ | Artist | Designer | Creator",
    "Creating magic through art 🎨 | Visual Artist | Creative Professional",
    "Turning ideas into visual stories ✨ | Designer | Artist | Creator",
    "Creating with heart and soul 🎭 | Visual Artist | Designer",
    "Where creativity meets innovation ✨ | Artist | Designer | Creator",
    "Creating art that inspires 🎨 | Visual Creator | Artist"
  ],
  fitness: [
    "Fitness is not about being better than someone else. It's about being better than you used to be 💪",
    "Strong body, strong mind 💪 | Fitness Coach | Health Advocate",
    "Your body can do it. It's your mind you need to convince 🧠 | Fitness Enthusiast",
    "Train like an athlete, eat like a nutritionist, sleep like a baby 💪",
    "The only bad workout is the one that didn't happen 💪 | Fitness Enthusiast",
    "Strength doesn't come from what you can do. It comes from overcoming what you once thought you couldn't 💪",
    "Fitness is not a destination, it's a way of life 🏋️ | Health & Wellness",
    "Your body is a temple, but only if you treat it as one 💪 | Fitness Enthusiast",
    "The pain you feel today will be the strength you feel tomorrow 💪",
    "Fitness is not about being perfect. It's about being better 💪 | Health Advocate",
    "Strong is the new beautiful 💪 | Fitness Enthusiast | Wellness Coach",
    "Your health is an investment, not an expense 💪 | Fitness Professional",
    "The only workout you'll regret is the one you didn't do 💪",
    "Fitness is a journey, not a destination 🏋️ | Health & Wellness",
    "Train insane or remain the same 💪 | Fitness Enthusiast",
    "Fitness is not a punishment, it's a reward 💪 | Health Advocate",
    "Your body can do it. It's your mind you need to convince 🧠",
    "Fitness is about progress, not perfection 💪 | Wellness Coach",
    "The only bad workout is the one that didn't happen 💪 | Fitness Enthusiast",
    "Strong body, strong mind, strong spirit 💪 | Health & Wellness"
  ],
  travel: [
    "Not all those who wander are lost ✈️ | Travel Enthusiast | Adventure Seeker",
    "Collecting moments, not things 🌍 | Travel Blogger | Adventure Lover",
    "Travel is the only thing you buy that makes you richer ✈️ | Wanderlust",
    "Adventure is out there 🌍 | Travel Enthusiast | Explorer",
    "The world is a book, and those who do not travel read only one page 📖",
    "Travel far, travel wide, travel often ✈️ | Adventure Seeker | Explorer",
    "Life is short and the world is wide 🌍 | Travel Enthusiast | Wanderer",
    "Travel makes one modest. You see what a tiny place you occupy in the world ✈️",
    "Adventure awaits 🌍 | Travel Blogger | Explorer | Wanderlust",
    "Travel is my therapy ✈️ | Adventure Seeker | Travel Enthusiast",
    "The world is calling, and I must go 🌍 | Traveler | Explorer",
    "Travel far enough to meet yourself ✈️ | Adventure Seeker | Wanderer",
    "Adventure is worthwhile in itself 🌍 | Travel Enthusiast | Explorer",
    "Travel. Your money will return. Your time won't ✈️ | Wanderlust",
    "Explore. Dream. Discover. 🌍 | Travel Enthusiast | Adventure Lover",
    "Not all those who wander are lost ✈️ | Travel Blogger | Explorer",
    "Collecting memories, one destination at a time 🌍 | Travel Enthusiast",
    "Travel is the only thing you buy that makes you richer ✈️ | Wanderlust",
    "Adventure is calling 🌍 | Travel Enthusiast | Explorer",
    "The world is my playground ✈️ | Travel Blogger | Adventure Seeker"
  ],
  food: [
    "Food is my love language 🍕 | Foodie | Recipe Creator | Culinary Enthusiast",
    "Life is too short for bad food 🍔 | Food Blogger | Recipe Developer",
    "Good food, good mood 🍰 | Foodie | Culinary Creator | Recipe Enthusiast",
    "Food brings people together 🍕 | Food Blogger | Recipe Creator",
    "Eating is a necessity, but cooking is an art 🍳 | Chef | Food Enthusiast",
    "Food is not just eating energy, it's an experience 🍔 | Foodie | Culinary Lover",
    "One cannot think well, love well, sleep well, if one has not dined well 🍰",
    "Food is my therapy 🍕 | Food Blogger | Recipe Creator | Food Enthusiast",
    "Good food is good mood 🍔 | Foodie | Culinary Enthusiast",
    "Food is the ingredient that binds us together 🍰 | Food Blogger | Recipe Creator",
    "Cooking is love made visible 🍳 | Chef | Food Enthusiast | Recipe Developer",
    "Food is not just fuel, it's information 🍕 | Foodie | Health & Nutrition",
    "Good food, good friends, good times 🍔 | Food Blogger | Culinary Enthusiast",
    "Food is my passion 🍰 | Foodie | Recipe Creator | Culinary Lover",
    "Eating is a necessity, but cooking is an art 🍳 | Chef | Food Enthusiast",
    "Food brings people together 🍕 | Food Blogger | Recipe Creator",
    "Life is too short for bad food 🍔 | Food Enthusiast | Culinary Lover",
    "Good food, good mood 🍰 | Foodie | Recipe Creator",
    "Food is my love language 🍕 | Culinary Enthusiast | Food Blogger",
    "Cooking is love made visible 🍳 | Chef | Food Enthusiast"
  ],
  fashion: [
    "Fashion is what you adopt when you don't know who you are 👗 | Fashion Enthusiast",
    "Style is a way to say who you are without having to speak 👔 | Fashionista",
    "Fashion is architecture: it is a matter of proportions 👗 | Fashion Designer",
    "Fashion fades, style is eternal 👔 | Fashion Blogger | Style Creator",
    "Style is knowing who you are, what you want to say, and not giving a damn 👗",
    "Fashion is what you're offered four times a year by designers. Style is what you choose 👔",
    "Fashion is the armor to survive the reality of everyday life 👗 | Fashion Enthusiast",
    "Style is a way to express yourself without saying a word 👔 | Fashionista",
    "Fashion is about dressing according to what's fashionable. Style is more about being yourself 👗",
    "Fashion is instant language 👔 | Fashion Blogger | Style Enthusiast",
    "Style is a reflection of your attitude and personality 👗 | Fashionista",
    "Fashion is what you adopt when you don't know who you are 👔 | Fashion Enthusiast",
    "Style is knowing who you are 👗 | Fashion Blogger | Style Creator",
    "Fashion is architecture: it is a matter of proportions 👔 | Fashion Designer",
    "Style is a way to say who you are 👗 | Fashionista | Style Enthusiast",
    "Fashion fades, style is eternal 👔 | Fashion Blogger",
    "Style is a reflection of your attitude 👗 | Fashion Enthusiast",
    "Fashion is instant language 👔 | Style Creator",
    "Style is knowing who you are 👗 | Fashionista",
    "Fashion is architecture: it is a matter of proportions 👔 | Fashion Designer"
  ],
  tech: [
    "Code is poetry written in logic 💻 | Developer | Tech Enthusiast | Problem Solver",
    "Building the future, one line of code at a time 🚀 | Software Developer",
    "Technology is best when it brings people together 💻 | Tech Enthusiast",
    "Innovation distinguishes between a leader and a follower 💡 | Tech Professional",
    "The best way to predict the future is to invent it 💻 | Developer | Tech Enthusiast",
    "Code is like humor. When you have to explain it, it's bad 💻 | Developer",
    "Technology is a tool. What matters is how you use it 🚀 | Tech Enthusiast",
    "First, solve the problem. Then, write the code 💻 | Developer | Problem Solver",
    "Innovation is the ability to see change as an opportunity 💡 | Tech Professional",
    "The future belongs to those who code 💻 | Developer | Tech Enthusiast",
    "Technology is nothing. What's important is that you have faith in people 🚀",
    "Code is poetry written in logic 💻 | Developer | Tech Professional",
    "The best code is no code at all 💻 | Developer | Tech Enthusiast",
    "Innovation distinguishes between a leader and a follower 💡 | Tech Professional",
    "Technology is best when it brings people together 💻 | Tech Enthusiast",
    "Building the future, one line of code at a time 🚀 | Software Developer",
    "Code is like humor. When you have to explain it, it's bad 💻 | Developer",
    "Technology is a tool. What matters is how you use it 🚀 | Tech Enthusiast",
    "First, solve the problem. Then, write the code 💻 | Developer",
    "The future belongs to those who code 💻 | Tech Enthusiast"
  ],
  motivational: [
    "The only way to do great work is to love what you do 💪 | Motivational Speaker",
    "Success is not final, failure is not fatal: it is the courage to continue that counts 🚀",
    "Believe you can and you're halfway there ✨ | Motivational Speaker | Life Coach",
    "The future belongs to those who believe in the beauty of their dreams 🌟",
    "Don't watch the clock; do what it does. Keep going ⏰ | Motivational Speaker",
    "The only impossible journey is the one you never begin 🚀 | Life Coach",
    "Success is walking from failure to failure with no loss of enthusiasm 💪",
    "The way to get started is to quit talking and begin doing ✨ | Motivational Speaker",
    "You are never too old to set another goal or to dream a new dream 🌟",
    "The only person you are destined to become is the person you decide to be 💪",
    "It does not matter how slowly you go as long as you do not stop 🚀 | Motivator",
    "The future depends on what you do today ✨ | Motivational Speaker",
    "Success is the sum of small efforts repeated day in and day out 💪",
    "The only way to achieve the impossible is to believe it is possible 🌟",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart ✨",
    "The only way to do great work is to love what you do 💪 | Life Coach",
    "Success is not final, failure is not fatal 🚀 | Motivational Speaker",
    "Believe you can and you're halfway there ✨ | Motivator",
    "The future belongs to those who believe 🌟 | Motivational Speaker",
    "Don't watch the clock; do what it does ⏰ | Life Coach"
  ]
}

export default function InstagramBioGenerator() {
  const [mode, setMode] = useState<Mode>('bio')
  const [category, setCategory] = useState<Category>('all')
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [likedItems, setLikedItems] = useState<LikedItem[]>([])

  // Load liked items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('instagram-liked-items')
    if (saved) {
      setLikedItems(JSON.parse(saved))
    }
  }, [])

  // Save liked items to localStorage
  useEffect(() => {
    if (likedItems.length > 0) {
      localStorage.setItem('instagram-liked-items', JSON.stringify(likedItems))
    }
  }, [likedItems])

  const categoryIcons: Record<string, any> = {
    funny: Laugh,
    romantic: Heart,
    professional: Briefcase,
    casual: Coffee,
    inspirational: Sparkles,
    creative: Palette,
    fitness: Dumbbell,
    travel: Plane,
    food: Utensils,
    fashion: Camera,
    tech: TrendingUp,
    motivational: Sparkles
  }

  const filteredItems = useMemo(() => {
    const items = mode === 'bio' ? BIO_CATEGORIES : CAPTION_CATEGORIES
    let result: string[] = []
    
    if (category === 'all') {
      Object.values(items).forEach(cat => result.push(...cat))
    } else {
      result = items[category] || []
    }

    return result
  }, [mode, category])

  const copyToClipboard = async (text: string, index: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const shareItem = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Instagram ${mode === 'bio' ? 'Bio' : 'Caption'}`,
          text: text
        })
        toast.success('Shared!')
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyToClipboard(text, 'share')
      toast.success('Copied! Use paste to share.')
    }
  }

  const toggleLike = (text: string, categoryName: string) => {
    const itemId = `${mode}-${categoryName}-${text.substring(0, 20)}`
    const isLiked = likedItems.some(item => item.id === itemId)
    
    if (isLiked) {
      setLikedItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Removed from favorites')
    } else {
      setLikedItems(prev => [...prev, { id: itemId, mode, category: categoryName }])
      toast.success('Added to favorites!')
    }
  }

  const isLiked = (text: string, categoryName: string) => {
    const itemId = `${mode}-${categoryName}-${text.substring(0, 20)}`
    return likedItems.some(item => item.id === itemId)
  }

  const getCategoryName = (text: string): string => {
    const items = mode === 'bio' ? BIO_CATEGORIES : CAPTION_CATEGORIES
    for (const [cat, itemsList] of Object.entries(items)) {
      if (itemsList.includes(text)) {
        return cat
      }
    }
    return 'all'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <SidebarAd position="left" adKey="36d691042d95ac1ac33375038ec47a5c" />
      <SidebarAd position="right" adKey="36d691042d95ac1ac33375038ec47a5c" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center justify-center mb-4 sm:mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-4 sm:p-5 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Instagram className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-3 sm:mb-4">
              Instagram 650+ Bio/Captions 
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4 max-w-3xl mx-auto leading-relaxed">
              Browse and copy from 650+ pre-made Instagram bios and captions in different categories
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-100/60 p-2 sm:p-3 mb-6 sm:mb-8">
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setMode('bio')}
                className={`flex-1 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform active:scale-95 ${
                  mode === 'bio'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white shadow-xl shadow-pink-500/30 scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.01]'
                }`}
              >
                Bios
              </button>
              <button
                onClick={() => setMode('caption')}
                className={`flex-1 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform active:scale-95 ${
                  mode === 'caption'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white shadow-xl shadow-pink-500/30 scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.01]'
                }`}
              >
                Captions
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-100/60 p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span>Categories</span>
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setCategory('all')}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 transform active:scale-95 ${
                  category === 'all'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                All
              </button>
              {Object.keys(mode === 'bio' ? BIO_CATEGORIES : CAPTION_CATEGORIES).map(cat => {
                const Icon = categoryIcons[cat] || Camera
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat as Category)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm md:text-base font-bold transition-all duration-300 transform active:scale-95 flex items-center gap-2 ${
                      category === cat
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    <span className="sm:hidden">{cat.charAt(0).toUpperCase() + cat.slice(1).substring(0, 4)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Items Grid */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-100/60 p-5 sm:p-6 md:p-8">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 sm:py-20 md:py-24">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-6">
                  <Instagram className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-3">No {mode === 'bio' ? 'bios' : 'captions'} found</p>
                <p className="text-base sm:text-lg text-gray-500 max-w-md mx-auto">Try adjusting your category filter to find what you're looking for</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm sm:text-base text-gray-600">
                    Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> {mode === 'bio' ? 'bios' : 'captions'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredItems.map((item, index) => {
                    const itemId = `${mode}-${index}-${item.substring(0, 20)}`
                    const categoryName = getCategoryName(item)
                    const liked = isLiked(item, categoryName)
                    
                    return (
                      <div
                        key={index}
                        className="group bg-gradient-to-br from-white via-pink-50/50 to-white rounded-3xl p-5 sm:p-6 border-2 border-pink-100 hover:border-pink-300 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              {categoryName !== 'all' && categoryIcons[categoryName] && (
                                <div className="p-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl shadow-sm">
                                  {(() => {
                                    const Icon = categoryIcons[categoryName]
                                    return <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                                  })()}
                                </div>
                              )}
                              <span className="text-xs sm:text-sm font-bold text-pink-700 bg-gradient-to-r from-pink-100 to-rose-100 px-3 py-1.5 rounded-xl uppercase tracking-wide">
                                {categoryName}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleLike(item, categoryName)}
                            className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 transform active:scale-95 flex-shrink-0 ${
                              liked
                                ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 hover:from-red-200 hover:to-pink-200 shadow-md'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                            }`}
                            title={liked ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart className={`h-5 w-5 sm:h-6 sm:w-6 ${liked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        <p className="text-sm sm:text-base md:text-lg text-gray-900 mb-5 sm:mb-6 leading-relaxed min-h-[80px] sm:min-h-[100px] line-clamp-4">
                          {item}
                        </p>
                        
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={() => copyToClipboard(item, itemId)}
                            className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white rounded-2xl font-bold text-sm sm:text-base hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                          >
                            {copiedIndex === itemId ? (
                              <>
                                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => shareItem(item)}
                            className="px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

