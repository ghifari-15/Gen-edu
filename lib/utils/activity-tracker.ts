import Activity from '@/lib/models/Activity';
import { IActivity } from '@/lib/models/Activity';

export class ActivityTracker {
  // Track a new activity
  static async trackActivity(
    userId: string, 
    type: IActivity['type'], 
    data: {
      title: string;
      description?: string;
      metadata?: IActivity['metadata'];
    }
  ): Promise<IActivity | null> {
    try {
      const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const activity = new Activity({
        activityId,
        userId,
        type,
        title: data.title,
        description: data.description,
        metadata: data.metadata || {},
      });
      
      const savedActivity = await activity.save();
      console.log('Activity tracked successfully:', savedActivity.activityId);
      return savedActivity;
    } catch (error) {
      console.error('Error tracking activity:', error);
      return null;
    }
  }

  // Get recent activities for a user
  static async getRecentActivities(userId: string, limit: number = 10): Promise<IActivity[]> {
    try {
      const activities = await Activity.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  // Get total learning hours
  static async getTotalLearningHours(userId: string): Promise<number> {
    try {
      const result = await Activity.aggregate([
        {
          $match: {
            userId,
            type: { $in: ['learning_session', 'notebook_updated'] }
          }
        },
        {
          $group: {
            _id: null,
            totalMinutes: {
              $sum: '$metadata.sessionDuration'
            }
          }
        }
      ]);
      
      const totalMinutes = result[0]?.totalMinutes || 0;
      return Math.round((totalMinutes / 60) * 10) / 10;
    } catch (error) {
      console.error('Error calculating learning hours:', error);
      return 0;
    }
  }

  // Get activity statistics
  static async getActivityStats(userId: string) {
    try {
      // Get basic counts
      const [totalActivities, notebooksCreated, totalLearningHours] = await Promise.all([
        Activity.countDocuments({ userId }),
        Activity.countDocuments({ userId, type: 'notebook_created' }),
        this.getTotalLearningHours(userId),
      ]);

      // Get distinct active days
      const activityDaysResult = await Activity.aggregate([
        {
          $match: { userId }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            }
          }
        },
        {
          $count: 'activeDays'
        }
      ]);

      const activeDays = activityDaysResult[0]?.activeDays || 0;

      // Calculate streak days
      const recentActivities = await Activity.find({ userId })
        .sort({ timestamp: -1 })
        .select('timestamp')
        .limit(100);

      let streakDays = 0;
      if (recentActivities.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activityDates = recentActivities.map(activity => {
          const date = new Date(activity.timestamp);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        });
        
        const uniqueDates = [...new Set(activityDates)].sort((a, b) => b - a);
        
        let currentDate = today.getTime();
        for (const activityDate of uniqueDates) {
          if (activityDate === currentDate || activityDate === currentDate - 86400000) {
            streakDays++;
            currentDate = activityDate - 86400000;
          } else {
            break;
          }
        }
      }

      return {
        totalActivities,
        notebooksCreated,
        totalLearningHours,
        streakDays,
        activeDays,
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      return {
        totalActivities: 0,
        notebooksCreated: 0,
        totalLearningHours: 0,
        streakDays: 0,
        activeDays: 0,
      };
    }
  }
}
