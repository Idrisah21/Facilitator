/**
 * MonitoringJob - Main workflow job that runs hourly
 * Orchestrates the complete brand mention monitoring workflow
 */

import FacebookIntegration from '../integrations/FacebookIntegration';
import SentimentService from '../services/SentimentService';
import SlackIntegration from '../integrations/SlackIntegration';

class MonitoringJob {
  async execute() {
    console.log('🔄 Starting monitoring job at', new Date().toISOString());

    try {
      // Step 1: Fetch posts from Facebook
      console.log('📥 Fetching posts and tags from Facebook API...');
      const posts = await FacebookIntegration.getOwnPosts();
      console.log(`Found ${posts.length} posts`);

      // Step 2: Filter new items (using Redis cache)
      console.log('🔍 Filtering new items using Redis...');
      // TODO: Implement Redis caching

      // Step 3: Classify sentiment for each mention
      console.log('🧠 Classifying sentiment using GPT...');
      for (const post of posts) {
        const result = await SentimentService.classifySentiment(
          post.message
        );
        console.log(`Sentiment: ${result.sentiment} (${result.score})`);

        // Step 4: Handle based on sentiment
        if (result.sentiment === 'positive') {
          console.log('👍 Positive - Auto-liking and posting thank-you...');
          // TODO: Implement positive branch
        } else if (result.sentiment === 'negative') {
          console.log('⚠️ Negative - Generating response and sending Slack alert...');
          const response = await SentimentService.generateResponse(
            post.message,
            result.sentiment
          );
          await SlackIntegration.sendAlert(
            post.message,
            post.message,
            'negative'
          );
          // TODO: Post response to Facebook
        }
      }

      console.log('✅ Monitoring job completed successfully');
    } catch (error) {
      console.error('❌ Error in monitoring job:', error);
      throw error;
    }
  }
}

export default new MonitoringJob();
