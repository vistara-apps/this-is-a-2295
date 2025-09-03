# NicheSpark

NicheSpark is a web application where students can create and join niche communities based on their academic or career interests, fostering collaboration and AI-powered startup creation.

## Features

### Niche Community Creation & Discovery
- Create and join communities based on specific academic fields or career paths
- Discover communities through search and recommendations
- Engage in discussions with like-minded peers

### AI Business Building Hub
- Get AI-powered feedback on business ideas
- Generate market analysis for startup concepts
- Create detailed action plans for implementation
- Save and manage AI responses for future reference

### Peer-to-Peer Mentorship
- Find mentors in your field of interest
- Offer mentorship to others
- Send and manage mentorship requests
- Maintain active mentorship relationships

### Skill Development Resources
- Discover curated learning resources
- Bookmark resources for later reference
- Contribute resources to the community
- Get personalized resource recommendations

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **AI Integration**: OpenAI API
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/nichespark.git
   cd nichespark
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_API_URL=your_api_url_for_stripe
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Database Schema

The application uses the following main tables:

- `users`: User profiles and authentication
- `communities`: Community information
- `community_members`: User membership in communities
- `posts`: Community posts
- `comments`: Post comments
- `user_subscriptions`: Subscription information
- `resources`: Learning resources
- `mentorship_profiles`: User mentorship profiles
- `mentorships`: Active mentorship relationships

## Subscription Tiers

NicheSpark offers three subscription tiers:

1. **Free**
   - Join up to 5 communities
   - Create posts and comments
   - Access to basic resources
   - Basic AI features

2. **Premium** ($5/month)
   - Join unlimited communities
   - Create and moderate communities
   - Enhanced AI features
   - Access to premium resources
   - Basic mentorship features

3. **Pro** ($15/month)
   - All Premium features
   - Full access to AI business building tools
   - Advanced mentorship features
   - Priority support
   - Access to exclusive workshops and events
   - Advanced analytics and insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

