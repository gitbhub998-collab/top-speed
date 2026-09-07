import { getCars } from '../services/supabaseDataService.js';
import { recommendCars, getRecommendationExplanation } from '../services/recommendationEngine.js';

export const getRecommendations = async (req, res) => {
  try {
    const { performanceLevel, engineType, drivingStyle, modificationInterest } =
      req.body;

    const cars = await getCars({ isVisible: true, includeHidden: 'false' });

    const preferences = {
      performanceLevel,
      engineType,
      drivingStyle,
      modificationInterest,
    };

    const recommendations = recommendCars(cars, preferences);
    const explanations = recommendations.map((rec) =>
      getRecommendationExplanation(rec.car, rec.score, rec.reasons)
    );

    res.json(explanations);
  } catch (error) {
    res.status(500).json({ error: 'Unable to generate recommendations' });
  }
};
