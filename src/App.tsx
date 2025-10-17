import { useEffect, useState } from 'react';
import { trainingPlanService } from './services/training-plan.service';
import type { TrainingPlan } from './services/training-plan.service';

function App() {
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingPlans = async () => {
      try {
        const response = await trainingPlanService.getAll();
        setTrainingPlans(response.items);
        setError(null);
      } catch (err) {
        setError('Failed to fetch training plans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPlans();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Training Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainingPlans.map((plan) => (
          <div key={plan._id} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            {/* Add more plan details here */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
