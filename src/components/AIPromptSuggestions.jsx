import React from 'react';
import { Lightbulb, Rocket, BarChart, Target } from 'lucide-react';

/**
 * AIPromptSuggestions component for displaying AI prompt suggestions
 * 
 * @param {Object} props
 * @param {Function} props.onSelectPrompt - Callback for selecting a prompt
 * @param {string} props.category - Category of prompts to display
 */
function AIPromptSuggestions({ onSelectPrompt, category = 'business' }) {
  // Different prompt categories
  const promptCategories = {
    business: [
      {
        icon: <Lightbulb className="h-5 w-5" />,
        title: "Idea Refinement",
        prompts: [
          "I want to build an AI tool that helps students study more effectively. How can I refine this idea?",
          "My startup idea involves using machine learning for healthcare diagnostics. What are the key challenges I should address?",
          "I'm thinking about creating a platform that connects researchers with funding opportunities. How can I make this more viable?",
          "What if we used AI to automate customer service for small businesses? How can I differentiate this from existing solutions?"
        ]
      },
      {
        icon: <BarChart className="h-5 w-5" />,
        title: "Market Analysis",
        prompts: [
          "What's the market size and potential for an AI-powered study assistant for college students?",
          "Who are the main competitors in the AI healthcare diagnostics space, and what are their strengths and weaknesses?",
          "What are the key market trends in educational technology that I should consider for my startup?",
          "How saturated is the market for AI customer service solutions for small businesses?"
        ]
      },
      {
        icon: <Rocket className="h-5 w-5" />,
        title: "Business Model",
        prompts: [
          "What would be the most effective monetization strategy for an AI study assistant app?",
          "Should I use a freemium or subscription model for my healthcare AI diagnostics platform?",
          "How can I create a sustainable business model for a research funding connection platform?",
          "What pricing strategies work best for B2B SaaS products in the AI space?"
        ]
      },
      {
        icon: <Target className="h-5 w-5" />,
        title: "Action Plan",
        prompts: [
          "What are the first 5 steps I should take to validate my AI study assistant idea?",
          "Create a 3-month roadmap for developing an MVP for my healthcare AI diagnostics platform.",
          "What key milestones should I set for the first year of my research funding platform startup?",
          "How should I prioritize features for the first version of my AI customer service solution?"
        ]
      }
    ],
    mentorship: [
      {
        icon: <Lightbulb className="h-5 w-5" />,
        title: "Career Advice",
        prompts: [
          "What skills should I focus on developing for a career in AI research?",
          "How can I transition from a software engineering role to product management?",
          "What are the most promising career paths in the biotech industry for the next decade?",
          "How can I build a portfolio that demonstrates my data science skills to potential employers?"
        ]
      },
      {
        icon: <BarChart className="h-5 w-5" />,
        title: "Skill Development",
        prompts: [
          "What learning resources would you recommend for someone starting in machine learning?",
          "How can I improve my public speaking and presentation skills for academic conferences?",
          "What project management methodologies should I learn for leading technical teams?",
          "What programming languages and frameworks are most valuable for a career in web3 development?"
        ]
      }
    ],
    resources: [
      {
        icon: <Lightbulb className="h-5 w-5" />,
        title: "Learning Paths",
        prompts: [
          "What's the best learning path for becoming proficient in machine learning within 6 months?",
          "Can you recommend resources for learning about blockchain development from scratch?",
          "What books, courses, and projects would help me become a full-stack developer?",
          "What's a good learning roadmap for someone interested in quantum computing?"
        ]
      },
      {
        icon: <BarChart className="h-5 w-5" />,
        title: "Resource Recommendations",
        prompts: [
          "What are the best resources for learning React and modern frontend development?",
          "Can you recommend books and courses on entrepreneurship and startup fundamentals?",
          "What are the most helpful YouTube channels for learning about AI and machine learning?",
          "What academic journals should I follow to stay updated on advancements in biotechnology?"
        ]
      }
    ]
  };

  // Get prompts for the selected category
  const categoryPrompts = promptCategories[category] || promptCategories.business;

  return (
    <div className="space-y-6">
      {categoryPrompts.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <div className="flex items-center space-x-2 mb-3">
            {section.icon}
            <h3 className="text-lg font-semibold text-white">{section.title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {section.prompts.map((prompt, promptIndex) => (
              <button
                key={promptIndex}
                onClick={() => onSelectPrompt(prompt)}
                className="text-left p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AIPromptSuggestions;

