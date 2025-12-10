import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Try all three AI APIs in parallel for best response
    // This ensures we get the best answer from any available API
    const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''
    
    let response = ''
    const responses: string[] = []

    // Try all APIs in parallel for faster response
    const apiPromises: Promise<string>[] = []

    // Option 1: Groq API (FREE, Fast, Best Option)
    // Get API key from: https://console.groq.com/keys
    if (GROQ_API_KEY) {
      apiPromises.push(
        fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile', // Free and powerful
            messages: [
              {
                role: 'system',
                content: 'You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately, provide detailed information, and help users with any task. Be conversational and engaging like ChatGPT.'
              },
              ...(conversationHistory || []).slice(-10), // Last 10 messages for context
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        })
        .then(async (groqResponse) => {
          if (groqResponse.ok) {
            const data = await groqResponse.json()
            if (data.choices && data.choices[0] && data.choices[0].message) {
              return data.choices[0].message.content
            }
          }
          return ''
        })
        .catch(() => '')
      )
    }

    // Option 2: Google Gemini API (FREE tier available)
    // Get API key from: https://makersuite.google.com/app/apikey
    if (GEMINI_API_KEY) {
      apiPromises.push(
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a helpful AI assistant. Answer the following question accurately and in detail. Be conversational and engaging:\n\n${message}`
                }]
              }]
            })
          }
        )
        .then(async (geminiResponse) => {
          if (geminiResponse.ok) {
            const data = await geminiResponse.json()
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              return data.candidates[0].content.parts[0].text
            }
          }
          return ''
        })
        .catch(() => '')
      )
    }

    // Option 3: Hugging Face Inference API (Free but slower)
    // Try a better model if available
    if (HUGGINGFACE_API_KEY) {
      apiPromises.push(
        fetch(
          'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
            },
            body: JSON.stringify({
              inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful AI assistant. Answer questions accurately and in detail.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
              parameters: {
                max_new_tokens: 1000,
                temperature: 0.7
              }
            })
          }
        )
        .then(async (hfResponse) => {
          if (hfResponse.ok) {
            const data = await hfResponse.json()
            if (data && typeof data === 'object') {
              if (data.generated_text) {
                return data.generated_text.replace(/<\|.*?\|>/g, '').trim()
              }
              if (Array.isArray(data) && data[0] && data[0].generated_text) {
                return data[0].generated_text.replace(/<\|.*?\|>/g, '').trim()
              }
            }
          }
          return ''
        })
        .catch(() => '')
      )
    }

    // Wait for all API calls to complete (with timeout)
    try {
      const results = await Promise.allSettled(
        apiPromises.map(p => Promise.race([
          p,
          new Promise<string>((resolve) => setTimeout(() => resolve(''), 8000)) // 8 second timeout per API
        ]))
      )

      // Collect all successful responses
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.trim().length > 10) {
          responses.push(result.value.trim())
        }
      }

      // Use the first successful response (prioritize Groq > Gemini > Hugging Face)
      if (responses.length > 0) {
        response = responses[0]
      }
    } catch (error) {
      console.log('Error fetching from APIs:', error)
    }

    // Fallback: Generate intelligent response based on message content
    if (!response) {
      response = generateFallbackResponse(message, conversationHistory || [])
    }

    // If still no response, provide a helpful default
    if (!response || response.trim().length === 0) {
      response = 'I understand your question. Let me help you with that. Could you provide a bit more context so I can give you the most accurate answer?'
    }

    return NextResponse.json({
      response: response.trim()
    })

  } catch (error: any) {
    console.error('Chat assistance error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// Knowledge base for factual questions with detailed information
const knowledgeBase: { [key: string]: string } = {
  'prime minister of india': 'Narendra Modi is the Prime Minister of India. He has been serving as the Prime Minister since 2014.',
  'pm of india': 'Narendra Modi is the Prime Minister of India.',
  'who is prime minister of india': 'Narendra Modi is the Prime Minister of India. He has been serving in this role since 2014.',
  'current prime minister of india': 'Narendra Modi is the current Prime Minister of India.',
  'prime minister india': 'Narendra Modi is the Prime Minister of India.',
  'pm india': 'Narendra Modi is the Prime Minister of India.',
  'narendra modi': 'Narendra Modi is the 14th and current Prime Minister of India, serving since May 2014. He was born on September 17, 1950, in Vadnagar, Gujarat. Before becoming Prime Minister, he served as the Chief Minister of Gujarat from 2001 to 2014. He is a member of the Bharatiya Janata Party (BJP) and is known for his economic reforms, digital initiatives like Digital India, and various social welfare programs. He was re-elected as Prime Minister in 2019.',
  'about narendra modi': 'Narendra Modi is the 14th and current Prime Minister of India, serving since May 2014. He was born on September 17, 1950, in Vadnagar, Gujarat. Before becoming Prime Minister, he served as the Chief Minister of Gujarat from 2001 to 2014. He is a member of the Bharatiya Janata Party (BJP) and is known for his economic reforms, digital initiatives like Digital India, and various social welfare programs. He was re-elected as Prime Minister in 2019.',
  'tell me about narendra modi': 'Narendra Modi is the 14th and current Prime Minister of India, serving since May 2014. He was born on September 17, 1950, in Vadnagar, Gujarat. Before becoming Prime Minister, he served as the Chief Minister of Gujarat from 2001 to 2014. He is a member of the Bharatiya Janata Party (BJP) and is known for his economic reforms, digital initiatives like Digital India, Make in India, Swachh Bharat Abhiyan, and various social welfare programs. He was re-elected as Prime Minister in 2019 with a majority.',
  'president of india': 'Droupadi Murmu is the 15th and current President of India, serving since July 2022. She is the first tribal person and the second woman to hold the office of President of India.',
  'who is president of india': 'Droupadi Murmu is the 15th and current President of India, serving since July 2022. She is the first tribal person and the second woman to hold the office of President of India.',
  'capital of india': 'New Delhi is the capital of India. It is located in the northern part of the country and serves as the seat of the Government of India.',
  'what is capital of india': 'The capital of India is New Delhi. It is located in the northern part of the country and serves as the seat of the Government of India.',
  'population of india': 'India has a population of approximately 1.4 billion people, making it the second most populous country in the world after China.',
  'largest city in india': 'Mumbai is the largest city in India by population, with over 20 million people in the metropolitan area.',
  'currency of india': 'The currency of India is the Indian Rupee (INR), symbolized as ₹.',
  'national animal of india': 'The national animal of India is the Bengal Tiger (Panthera tigris tigris).',
  'national bird of india': 'The national bird of India is the Indian Peacock (Pavo cristatus).',
  'president of usa': 'Joe Biden',
  'who is president of usa': 'Joe Biden is the President of the United States.',
  'prime minister of uk': 'Rishi Sunak',
  'who is prime minister of uk': 'Rishi Sunak is the Prime Minister of the United Kingdom.',
  // Australia specifics
  'president of australia': 'Australia does not have a president. The head of state is King Charles III, represented by the Governor-General (currently David Hurley). The head of government is the Prime Minister (currently Anthony Albanese).',
  'who is president of australia': 'Australia does not have a president. The head of state is King Charles III, represented by Governor-General David Hurley. The head of government is Prime Minister Anthony Albanese.',
  'prime minister of australia': 'Anthony Albanese is the Prime Minister of Australia. He has served since May 2022.',
  'who is prime minister of australia': 'Anthony Albanese is the Prime Minister of Australia. He has served since May 2022.',
  'head of state of australia': 'King Charles III is the head of state of Australia, represented by Governor-General David Hurley.',
  'governor general of australia': 'David Hurley is the Governor-General of Australia, representing the head of state King Charles III.',
  'capital of usa': 'Washington D.C.',
  'capital of uk': 'London',
  'capital of france': 'Paris',
  'capital of japan': 'Tokyo',
  'capital of china': 'Beijing',
  'largest country in world': 'Russia is the largest country in the world by land area.',
  'smallest country in world': 'Vatican City is the smallest country in the world.',
  'tallest mountain in world': 'Mount Everest is the tallest mountain in the world.',
  'longest river in world': 'The Nile River is the longest river in the world.',
  'largest ocean in world': 'The Pacific Ocean is the largest ocean in the world.',
  'largest continent': 'Asia is the largest continent.',
  'number of continents': 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.',
  'speed of light': 'The speed of light is approximately 299,792,458 meters per second (about 300,000 km/s).',
  'value of pi': 'Pi (π) is approximately 3.14159, but it\'s an irrational number with infinite decimal places.',
  'largest planet': 'Jupiter is the largest planet in our solar system.',
  'closest planet to sun': 'Mercury is the closest planet to the Sun.',
  'number of planets': 'There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.',
}

function findAnswerInKnowledgeBase(message: string): string | null {
  const lowerMessage = message.toLowerCase().trim().replace(/[^\w\s]/g, '')
  
  // Direct lookup
  if (knowledgeBase[lowerMessage]) {
    return knowledgeBase[lowerMessage]
  }
  
  // Handle typos and variations for "india" -> "inda"
  const normalizedMessage = lowerMessage.replace(/\binda\b/g, 'india')
  if (knowledgeBase[normalizedMessage]) {
    return knowledgeBase[normalizedMessage]
  }
  
  // Pattern matching for common question formats - check if message contains key
  for (const [key, answer] of Object.entries(knowledgeBase)) {
    // Check if the key is contained in the message or vice versa
    if (lowerMessage.includes(key) || normalizedMessage.includes(key)) {
      return answer
    }
    // Also check if key words match
    const keyWords = key.split(/\s+/)
    const messageWords = lowerMessage.split(/\s+/)
    const matchCount = keyWords.filter(kw => messageWords.some(mw => mw.includes(kw) || kw.includes(mw))).length
    if (matchCount >= keyWords.length * 0.7) { // 70% match threshold
      return answer
    }
  }
  
  // Special handling for "who is" questions
  if (lowerMessage.match(/who is (the )?(.+)/)) {
    const match = lowerMessage.match(/who is (the )?(.+)/)
    if (match && match[2]) {
      const subject = match[2].replace(/\?/g, '').trim().replace(/\binda\b/g, 'india')
      // Try direct match first
      for (const [key, answer] of Object.entries(knowledgeBase)) {
        if (key.includes(subject) || subject.includes(key)) {
          return answer
        }
      }
      // Try partial match
      const subjectWords = subject.split(/\s+/)
      for (const [key, answer] of Object.entries(knowledgeBase)) {
        const keyWords = key.split(/\s+/)
        const matchCount = subjectWords.filter(sw => keyWords.some(kw => kw.includes(sw) || sw.includes(kw))).length
        if (matchCount >= subjectWords.length * 0.6) {
          return answer
        }
      }
    }
  }
  
  // Special handling for "what is" questions
  if (lowerMessage.match(/what is (the )?(.+)/)) {
    const match = lowerMessage.match(/what is (the )?(.+)/)
    if (match && match[2]) {
      const subject = match[2].replace(/\?/g, '').trim().replace(/\binda\b/g, 'india')
      for (const [key, answer] of Object.entries(knowledgeBase)) {
        if (key.includes(subject) || subject.includes(key)) {
          return answer
        }
      }
    }
  }
  
  return null
}

function generateFallbackResponse(message: string, history: any[]): string {
  const lowerMessage = message.toLowerCase().trim()
  
  // Check knowledge base first - this should handle factual questions
  const knowledgeAnswer = findAnswerInKnowledgeBase(message)
  if (knowledgeAnswer) {
    return knowledgeAnswer
  }
  
  // Handle questions about prime minister with typos
  if (lowerMessage.match(/prime minister.*ind[ai]/) || lowerMessage.match(/pm.*ind[ai]/)) {
    return 'Narendra Modi is the Prime Minister of India. He has been serving in this role since 2014.'
  }
  
  // Handle questions about Narendra Modi specifically - with various phrasings
  if (lowerMessage.match(/narendra modi|about modi|tell me.*modi|modi.*information|modi.*details|something.*modi|more.*modi|modi.*more/)) {
    return 'Narendra Modi is the 14th and current Prime Minister of India, serving since May 2014. He was born on September 17, 1950, in Vadnagar, Gujarat. Before becoming Prime Minister, he served as the Chief Minister of Gujarat from 2001 to 2014. He is a member of the Bharatiya Janata Party (BJP) and is known for his economic reforms, digital initiatives like Digital India, Make in India, Swachh Bharat Abhiyan, and various social welfare programs. He was re-elected as Prime Minister in 2019 with a majority.'
  }
  
  // Handle "tell me about" or "tell me something about" questions
  if (lowerMessage.match(/tell me (something )?(more )?about (.+)/)) {
    const match = lowerMessage.match(/tell me (something )?(more )?about (.+)/)
    if (match && match[3]) {
      const topic = match[3].trim()
      // Check knowledge base
      const topicLower = topic.toLowerCase()
      for (const [key, answer] of Object.entries(knowledgeBase)) {
        if (topicLower.includes(key) || key.includes(topicLower)) {
          return answer
        }
      }
      // If topic contains "modi" or "narendra"
      if (topicLower.includes('modi') || topicLower.includes('narendra')) {
        return 'Narendra Modi is the 14th and current Prime Minister of India, serving since May 2014. He was born on September 17, 1950, in Vadnagar, Gujarat. Before becoming Prime Minister, he served as the Chief Minister of Gujarat from 2001 to 2014. He is a member of the Bharatiya Janata Party (BJP) and is known for his economic reforms, digital initiatives like Digital India, Make in India, Swachh Bharat Abhiyan, and various social welfare programs. He was re-elected as Prime Minister in 2019 with a majority.'
      }
    }
  }
  
  // Casual greetings and variations
  if (lowerMessage.match(/^(hyy|hii|hiii|hiiii|hey|heyy|heyyy|hi|hello|greetings|good morning|good afternoon|good evening|sup|what's up|wassup|yo)/)) {
    const greetings = [
      'Hey! How are you doing today? 😊',
      'Hi there! How can I help you?',
      'Hello! Nice to meet you! What\'s on your mind?',
      'Hey! How\'s your day going?',
      'Hi! I\'m here to help. What would you like to know?',
      'Hey there! How are you? What can I do for you today?',
      'Hello! Great to see you! How can I assist?',
      'Hi! Hope you\'re having a good day! What can I help with?'
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  // Questions about the assistant
  if (lowerMessage.match(/(what are you|who are you|what can you do|your capabilities|tell me about you|tell me about yourself|who is you|what is you|describe yourself|introduce yourself)/)) {
    const aboutMeResponses = [
      'I\'m your Chat Assistance AI! I\'m here to help you with anything you need. I can answer questions, solve problems, help with writing, do calculations, provide explanations, and much more. Think of me as your friendly AI companion ready to assist you 24/7! 😊\n\nWhat would you like help with?',
      'Hey! I\'m your Chat Assistance - your AI helper and friend! I\'m designed to assist you with a wide variety of tasks like answering questions, solving problems, helping with writing, doing math, providing information, and offering suggestions.\n\nI\'m always here to help, so feel free to ask me anything! What can I do for you today?',
      'I\'m your Chat Assistance AI assistant! My job is to help you with whatever you need - whether it\'s answering questions, solving problems, helping with writing, doing calculations, or just having a conversation.\n\nI\'m friendly, helpful, and always ready to assist! What would you like to know or work on?',
      'Hi! I\'m your Chat Assistance - an AI assistant created to help you with all sorts of tasks. I can help with questions, problem-solving, writing, math, explanations, and more. I\'m here to make your life easier!\n\nWhat can I help you with today?'
    ]
    return aboutMeResponses[Math.floor(Math.random() * aboutMeResponses.length)]
  }

  // Math questions
  if (lowerMessage.match(/(calculate|what is|solve|math|equation|formula|\+|\-|\*|\/)/)) {
    try {
      // Try to evaluate simple math expressions
      const mathMatch = message.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/)
      if (mathMatch) {
        const [, num1, op, num2] = mathMatch
        const n1 = parseFloat(num1)
        const n2 = parseFloat(num2)
        let result: number
        switch(op) {
          case '+': result = n1 + n2; break
          case '-': result = n1 - n2; break
          case '*': result = n1 * n2; break
          case '/': result = n2 !== 0 ? n1 / n2 : 0; break
          default: throw new Error('Invalid operator')
        }
        return `The answer is ${result}.`
      }
      
      // Percentage calculations
      const percentMatch = message.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|from)\s*(\d+(?:\.\d+)?)/i)
      if (percentMatch) {
        const [, percent, number] = percentMatch
        const result = (parseFloat(percent) / 100) * parseFloat(number)
        return `${percent}% of ${number} is ${result}.`
      }
    } catch (e) {
      // Continue to general response
    }
    return 'I can help with calculations! Try asking something like "What is 25 + 37?" or "Calculate 15% of 200". For more complex problems, please provide the specific numbers and operation you\'d like me to solve.'
  }

  // Coding/programming questions
  if (lowerMessage.match(/(code|programming|function|variable|syntax|bug|error|debug|javascript|python|html|css|react)/)) {
    return 'I can help with programming questions! Please provide:\n\n• The programming language you\'re using\n• The specific problem or error you\'re encountering\n• Any relevant code snippets\n\nI\'ll do my best to help you solve it!'
  }

  // Writing assistance
  if (lowerMessage.match(/(write|essay|paragraph|sentence|grammar|spelling|proofread|draft|compose)/)) {
    return 'I can help with writing! I can:\n\n• Help structure your writing\n• Check grammar and spelling\n• Suggest improvements\n• Help with different writing styles\n\nShare what you\'d like to write about, and I\'ll assist you!'
  }

  // Definition requests - provide actual definitions
  if (lowerMessage.match(/(what is|what does|define|definition|meaning of|explain)/)) {
    const topicMatch = message.match(/(?:what is|what does|define|explain)\s+(.+)/i)
    const topic = topicMatch ? topicMatch[1].replace(/\?/g, '').trim() : ''
    
    // Check knowledge base first
    const topicLower = topic.toLowerCase()
    for (const [key, answer] of Object.entries(knowledgeBase)) {
      if (topicLower.includes(key) || key.includes(topicLower)) {
        return answer
      }
    }
    
    // Provide helpful response if topic not found
    if (topic) {
      return `"${topic}" is an interesting topic. While I have knowledge on many subjects, I may need more specific information about what aspect of "${topic}" you'd like to know about.\n\nI can help with:\n• General explanations and definitions\n• Historical information\n• Scientific concepts\n• Current events and facts\n• Problem-solving\n\nCould you provide more details about what specifically you'd like to know about "${topic}"?`
    }
    
    return 'I\'d be happy to explain! Could you tell me what specific topic or concept you\'d like me to define or explain?'
  }

  // How-to questions
  if (lowerMessage.match(/(how to|how do|how can|steps to|guide|tutorial)/)) {
    return 'I can help you with step-by-step guidance! To provide the most useful instructions, please share:\n\n• What you want to accomplish\n• Your current level of experience\n• Any specific requirements or constraints\n\nI\'ll provide clear, actionable steps to help you achieve your goal.'
  }

  // General questions - try to provide helpful response
  if (lowerMessage.endsWith('?') || lowerMessage.match(/\?/)) {
    // Check if it's a factual question we might know
    const questionTopic = message.replace(/\?/g, '').trim()
    
    // Try to extract key terms and provide a helpful response
    if (lowerMessage.match(/(who|what|where|when|why|how|which|whose|whom)/)) {
      return `I understand you're asking about "${questionTopic}". While I have knowledge on many topics, I may not have the specific information you're looking for in my current knowledge base.\n\nCould you rephrase your question or provide more context? I can help with:\n\n• General knowledge questions\n• Problem-solving\n• Calculations\n• Writing assistance\n• Explanations and definitions\n\nWhat specific aspect would you like me to help you with?`
    }
    
    return `That's an interesting question about "${questionTopic}". I'd be happy to help!\n\nTo give you the best answer, could you provide a bit more context or rephrase your question? I can assist with various topics including general knowledge, problem-solving, calculations, and more.`
  }

  // Problem-solving requests
  if (lowerMessage.match(/(problem|issue|trouble|help|stuck|don't know|can't|unable|difficulty)/)) {
    return 'I\'m here to help solve your problem! To provide the best assistance, please share:\n\n• What specific problem are you facing?\n• What have you already tried?\n• What is your goal or desired outcome?\n• Any relevant context or constraints\n\nWith this information, I can offer targeted solutions and step-by-step guidance.'
  }

  // Thank you responses
  if (lowerMessage.match(/(thank|thanks|appreciate|grateful|ty|thx)/)) {
    const thanksResponses = [
      'You\'re welcome! Happy to help! 😊',
      'You\'re very welcome! Feel free to ask if you need anything else!',
      'Anytime! I\'m here whenever you need me!',
      'You\'re welcome! Glad I could assist you!',
      'My pleasure! Don\'t hesitate to reach out if you have more questions!'
    ]
    return thanksResponses[Math.floor(Math.random() * thanksResponses.length)]
  }

  // How are you / feeling questions
  if (lowerMessage.match(/(how are you|how r u|how do you feel|how's it going|how are things)/)) {
    const feelingResponses = [
      'I\'m doing great, thank you for asking! How are you doing?',
      'I\'m doing well! Always happy to help. How about you?',
      'I\'m fantastic! Ready to help you with anything. How are you?',
      'I\'m doing wonderful! Thanks for asking. How can I help you today?',
      'I\'m great! Hope you\'re having a good day too! What can I do for you?'
    ]
    return feelingResponses[Math.floor(Math.random() * feelingResponses.length)]
  }

  // Goodbye / farewell
  if (lowerMessage.match(/(bye|goodbye|see you|see ya|later|cya|farewell|take care)/)) {
    const goodbyeResponses = [
      'Goodbye! Take care and feel free to come back anytime! 👋',
      'See you later! Have a great day!',
      'Bye! It was nice chatting with you!',
      'Take care! I\'ll be here whenever you need me!',
      'Goodbye! Hope to see you again soon!'
    ]
    return goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)]
  }

  // Compliments
  if (lowerMessage.match(/(you're|you are|you're so|you are so|amazing|awesome|great|good|smart|intelligent|helpful|nice|cool|wonderful)/)) {
    const complimentResponses = [
      'Aww, thank you so much! That\'s really kind of you to say! 😊',
      'Thank you! I really appreciate that! How can I help you today?',
      'You\'re so sweet! Thank you! I\'m here to help with anything you need!',
      'That means a lot! Thank you! What would you like to work on together?',
      'You\'re too kind! Thanks! I\'m always here to help!'
    ]
    return complimentResponses[Math.floor(Math.random() * complimentResponses.length)]
  }

  // Short messages - respond more casually
  if (message.length < 20 && !lowerMessage.endsWith('?')) {
    const shortResponses = [
      'I\'m here! What can I help you with? 😊',
      'Yes? How can I assist you?',
      'Tell me more! What do you need help with?',
      'I\'m listening! What would you like to know?',
      'Sure! What can I do for you?'
    ]
    return shortResponses[Math.floor(Math.random() * shortResponses.length)]
  }

  // Try to extract topic and provide helpful response
  const words = lowerMessage.split(/\s+/).filter(w => w.length > 2)
  const importantWords = words.filter(w => !['the', 'is', 'are', 'was', 'were', 'what', 'who', 'where', 'when', 'why', 'how', 'tell', 'me', 'about', 'something', 'more'].includes(w))
  
  // Check if we can find related information
  let foundTopic = false
  for (const word of importantWords) {
    for (const [key, answer] of Object.entries(knowledgeBase)) {
      if (key.includes(word) || word.length > 4 && key.includes(word.substring(0, 4))) {
        return answer
      }
    }
  }
  
  // Default intelligent response with context awareness
  const context = history.length > 0 ? `Based on our conversation, ` : ''
  const lastUserMessage = history.filter((m: any) => m.role === 'user').slice(-1)[0]
  const hasContext = lastUserMessage && lastUserMessage.content.toLowerCase() !== lowerMessage
  
  // Extract main topic from message
  const topic = message.replace(/^(tell me|about|something|more|what|who|where|when|why|how|is|are|the|a|an)\s+/gi, '').replace(/\?/g, '').trim()
  
  if (topic && topic.length > 3) {
    return `${context}I understand you're asking about "${topic}". Let me provide you with helpful information.\n\nWhile I have knowledge on many topics, I may need more specific details about what aspect of "${topic}" you'd like to explore. I can help with:\n\n• Detailed explanations and information\n• Historical context and background\n• Current facts and data\n• Step-by-step guidance\n• Problem-solving approaches\n\nWhat specific information about "${topic}" would be most helpful to you?`
  }
  
  let response = `${context}I understand you're asking about "${message}". `
  
  if (hasContext) {
    response += `Building on our previous discussion, `
  }
  
  response += `I'm here to help! I can assist with:\n\n• Answering factual questions\n• Providing detailed explanations\n• Problem-solving and analysis\n• Writing assistance\n• Calculations and conversions\n• General knowledge and information\n\nWhat specific topic or question would you like me to help you with?`
  
  return response
}

